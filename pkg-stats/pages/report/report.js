// pkg-stats/pages/report/report.js —— M12 报表导出
const api = require('../../../utils/api');

const STATUS_NAME = {
  qualified: '合格', pending_test: '待检', in_use: '领用中',
  maintaining: '维修中', scrapped: '已报废', missing: '缺失/禁用',
};
const CAT_NAME = {
  insulation: '绝缘工器具', motor: '手持电动机具', manual: '通用手动工具',
  lifting: '起重承压类', height: '高空防护器具', measure: '计量检测器具',
  temp_power: '临时配电配套', lease: '大型租赁机具',
};

Page({
  data: { loading: true, total: 0, byStatus: [], byCategory: [] },

  async onLoad() { await this.load(); },

  async load() {
    this.setData({ loading: true });
    const d = await api.exportReport({}).catch(() => null);
    if (!d) { this.setData({ loading: false }); return; }
    const byStatus = Object.keys(d.byStatus || {}).map((k) => ({ name: STATUS_NAME[k] || k, value: d.byStatus[k] }));
    const byCategory = Object.keys(d.byCategory || {}).map((k) => ({ name: CAT_NAME[k] || k, value: d.byCategory[k] }));
    this.setData({ total: d.total, byStatus, byCategory, loading: false });
  },

  onCopy() {
    const lines = ['工器具安全管理 — 报表导出'];
    lines.push('器具总数：' + this.data.total);
    lines.push('—— 按状态 ——');
    this.data.byStatus.forEach((it) => lines.push(`${it.name}：${it.value}`));
    lines.push('—— 按类别 ——');
    this.data.byCategory.forEach((it) => lines.push(`${it.name}：${it.value}`));
    wx.setClipboardData({
      data: lines.join('\n'),
      success: () => wx.showToast({ title: '已复制报表', icon: 'none' }),
    });
  },
});
