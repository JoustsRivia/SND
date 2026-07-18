// cloudfunctions/stats/index.js —— M12 统计分析（纯业务，只引用 helpers）
const db = require('./helpers/db');
const { getOpenid } = require('./helpers/user');
const ok = (data) => ({ code: 0, data });
const fail = (message, code = 1) => ({ code, message });
const baseFilter = (orgId) => (orgId ? { orgId } : {});

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 总览驾驶舱 / 项目部看板（同一口径按 orgId 过滤）
async function dashboard(payload = {}) {
  const { orgId } = payload;
  const b = baseFilter(orgId);
  const [total, qualified, pending, scrapped, maintaining, missing, expiring, warns] = await Promise.all([
    db.countBy('tools', b),
    db.countBy('tools', { ...b, status: 'qualified' }),
    db.countBy('tools', { ...b, status: 'pending_test' }),
    db.countBy('tools', { ...b, status: 'scrapped' }),
    db.countBy('tools', { ...b, status: 'maintaining' }),
    db.countBy('tools', { ...b, status: 'missing' }),
    db.countBy('tools', { ...b, status: 'qualified', ...db.expiringSoon(15) }),
    db.countBy('warnings', orgId ? { orgId, read: false } : { read: false }),
  ]);
  const growth = {
    total: total.total,
    qualifiedRate: total.total ? Math.round((qualified.total / total.total) * 100) : 0,
    attention: expiring.total + warns.total,
  };
  return ok({
    total: total.total, qualified: qualified.total, pendingTest: pending.total,
    scrapped: scrapped.total, maintaining: maintaining.total, missing: missing.total,
    expiringSoon: expiring.total, warnings: warns.total,
    growth,
  });
}

// 个人工作台统计（我的页）
async function myStats() {
  const openid = getOpenid();
  const [t, q, pending, warns, checks] = await Promise.all([
    db.countBy('tools', {}),
    db.countBy('tools', { status: 'qualified' }),
    db.countBy('tools', { status: 'pending_test' }),
    db.countBy('warnings', { read: false }),
    db.countBy('spot_checks', { operator: openid }),
  ]);
  return ok({
    todo: warns.total + pending.total,
    checkCount: checks.total,
    qualifiedRate: t.total ? Math.round((q.total / t.total) * 100) : 0,
  });
}

// 六化达标（真实口径，不再硬编码 100）
async function sixStandard() {
  const [t, q, c, h, hc, cer, u, tools, scrapped, disposed] = await Promise.all([
    db.countBy('tools', {}),
    db.countBy('tools', { status: 'qualified' }),
    db.countBy('spot_checks', {}),
    db.countBy('hazards', {}),
    db.countBy('hazards', { status: 'closed' }),
    db.countBy('certificates', { status: 'valid' }),
    db.countBy('users', {}),
    db.listBy('tools', {}, 500),
    db.countBy('tools', { status: 'scrapped' }),
    db.countBy('scrap_records', { status: 'disposed' }),
  ]);
  const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
  // 一物一档完整率：必填字段齐全的器具占比
  const required = ['name', 'code', 'category', 'expireAt', 'store'];
  const complete = (tools.data || []).filter((x) => required.every((k) => x[k])).length;
  // 报废处置合规率：已规范处置的报废数 / 报废总数
  const scrapRate = scrapped.total ? pct(disposed.total, scrapped.total) : 100;
  return ok({
    dims: [
      { key: 'test',   name: '器具检测合格率',   done: q.total,  total: t.total, rate: pct(q.total, t.total) },
      { key: 'spot',   name: '班前点检执行率', done: c.total,  total: t.total, rate: pct(c.total, t.total) },
      { key: 'hazard', name: '隐患整改闭环率', done: hc.total, total: h.total, rate: pct(hc.total, h.total) },
      { key: 'cert',   name: '关键岗位持证率', done: cer.total, total: u.total, rate: pct(cer.total, u.total) },
      { key: 'scrap',  name: '报废处置合规率', done: disposed.total, total: scrapped.total, rate: scrapRate },
      { key: 'ledger', name: '一物一档完整率', done: complete, total: t.total, rate: pct(complete, t.total) },
    ],
  });
}

// 报表导出聚合（M12 报表导出）
async function exportReport(payload = {}) {
  const { orgId } = payload;
  const b = baseFilter(orgId);
  const statuses = ['qualified', 'pending_test', 'in_use', 'maintaining', 'scrapped', 'missing'];
  const cats = ['insulation', 'motor', 'manual', 'lifting', 'height', 'measure', 'temp_power', 'lease'];
  const total = await db.countBy('tools', b);
  const byStatus = {}; const byCategory = {};
  await Promise.all(statuses.map(async (s) => { const r = await db.countBy('tools', { ...b, status: s }); byStatus[s] = r.total; }));
  await Promise.all(cats.map(async (c) => { const r = await db.countBy('tools', { ...b, category: c }); byCategory[c] = r.total; }));
  return ok({ total: total.total, byStatus, byCategory });
}

// 每日指标快照（答复4：每日采集一次，支撑趋势与未来分析）
// 由云函数定时器触发（config.json triggers），也可手动调用 action=snapshot
async function snapshot() {
  const today = ymd(new Date());
  const [d, s] = await Promise.all([dashboard({}), sixStandard()]);
  const doc = {
    date: today,
    total: d.data.total, qualified: d.data.qualified, pendingTest: d.data.pendingTest,
    scrapped: d.data.scrapped, maintaining: d.data.maintaining, missing: d.data.missing,
    expiringSoon: d.data.expiringSoon, warnings: d.data.warnings,
    dims: (s.data && s.data.dims) || [],
    createdAt: new Date(),
  };
  // 同日不重复写入
  const exist = await db.listBy('daily_stats', { date: today }, 1);
  if ((exist.data || []).length) {
    const id = exist.data[0]._id;
    await db.update('daily_stats', id, doc);
    return ok({ date: today, updated: true });
  }
  const added = await db.add('daily_stats', doc);
  return ok({ _id: added._id, date: today, created: true });
}

// 趋势（最近 N 天快照）
async function trend(payload = {}) {
  const n = Math.min(payload.days || 14, 60);
  const res = await db.listBy('daily_stats', {}, 200);
  const list = (res.data || [])
    .map((x) => ({ date: x.date, total: x.total, qualified: x.qualified, pendingTest: x.pendingTest, scrapped: x.scrapped, expiringSoon: x.expiringSoon }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-n);
  return ok(list);
}

exports.main = async (event) => {
  const { action, payload = {} } = event;
  try {
    // 定时器触发（无 action）默认执行快照采集
    if (!action || (event && event.triggerName)) return snapshot();
    switch (action) {
      case 'dashboard': return dashboard(payload);
      case 'project': return dashboard(payload);
      case 'myStats': return myStats(payload);
      case 'sixStandard': return sixStandard(payload);
      case 'exportReport': return exportReport(payload);
      case 'snapshot': return snapshot();
      case 'trend': return trend(payload);
      default: return fail('未知 action: ' + action);
    }
  } catch (e) {
    return fail(e.message || '服务异常');
  }
};
