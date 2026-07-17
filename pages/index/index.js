// pages/index/index.js —— 工作台（角色化首页 + 待办）
const api = require('../../utils/api');
const auth = require('../../utils/auth');

const ROLE_TEXT = {
  lead: '专班负责人', project_lead: '项目部负责人', safety_officer: '专职安全员',
  group_lead: '班组长', supervisor: '安监管理', worker: '作业人员', lease_admin: '租赁管理员',
};

const QUICK = [
  { key: 'ledger', label: '台账', icon: '📋', type: 'primary' },
  { key: 'scan',   label: '扫码', icon: '📷', type: 'success' },
  { key: 'check',  label: '点检', icon: '✅', type: 'warning' },
  { key: 'message', label: '消息', icon: '🔔', type: 'danger' },
];

function greetingByHour(h) {
  if (h < 6) return '凌晨好';
  if (h < 12) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

function buildTodos(d) {
  const todos = [];
  if (d.warnings) todos.push({ key: 'warn', title: d.warnings + ' 条未读预警', desc: '及时处理试验超期与禁用告警', level: 'urgent' });
  if (d.pendingTest) todos.push({ key: 'test', title: d.pendingTest + ' 件器具待检', desc: '安排周期试验，避免超期', level: 'important' });
  if (d.expiringSoon) todos.push({ key: 'expire', title: d.expiringSoon + ' 件即将临期', desc: '关注有效期，防止禁用外流', level: 'notice' });
  return todos;
}

Page({
  data: {
    profile: null,
    roleText: '',
    avatarText: '工',
    greeting: '你好',
    todayText: '',
    dashboard: null,
    quick: QUICK,
    stats: [],
    todos: [],
    loading: true,
  },

  onShow() {
    // 问题1：未登录（含 auto 建档未绑定）一律拦截回登录页
    if (!auth.isLoggedIn()) { wx.reLaunch({ url: '/pages/login/login' }); return; }
    // F7 修复：每次切到首页先确保登录态，避免闪「未命名用户」
    auth.ensureLogin().catch(() => {});
    const p = auth.getProfile();
    this.applyProfile(p);
  },

  onLoad() {
    this.refresh();
  },

  onPullDownRefresh() {
    this.refresh().then(() => wx.stopPullDownRefresh());
  },

  applyProfile(p) {
    if (!p) { this.setData({ profile: null, roleText: '', avatarText: '工' }); return; }
    const name = p.nickName || p.username || '';
    this.setData({
      profile: p,
      roleText: ROLE_TEXT[p.role] || '成员',
      avatarText: (name ? name[0] : '工').toUpperCase(),
    });
  },

  async refresh() {
    this.setData({ loading: true });
    const now = new Date();
    this.setData({
      greeting: greetingByHour(now.getHours()),
      todayText: `${now.getMonth() + 1}月${now.getDate()}日`,
    });

    const p = auth.getProfile() || (await auth.ensureLogin().catch(() => null));
    this.applyProfile(p);

    const d = await api.getDashboard().catch(() => null);
    if (d) {
      this.setData({
        dashboard: d,
        stats: [
          { label: '器具总数', value: d.total, color: 'var(--c-primary)' },
          { label: '合格', value: d.qualified, color: 'var(--c-success)' },
          { label: '待检', value: d.pendingTest, color: 'var(--c-warning)' },
          { label: '超期预警', value: d.expiringSoon, color: 'var(--c-danger)' },
        ],
        todos: buildTodos(d),
      });
    }
    this.setData({ loading: false });
  },

  onQuick(e) {
    const key = e.detail.key;
    const map = {
      ledger: { tab: true, url: '/pages/ledger/ledger' },
      scan: { tab: true, url: '/pages/scan/scan' },
      message: { tab: true, url: '/pages/message/message' },
      check: { tab: false, url: '/pkg-site/pages/daily-check/daily-check' },
    };
    const m = map[key];
    if (!m) return;
    if (m.tab) wx.switchTab({ url: m.url });
    else wx.navigateTo({ url: m.url });
  },

  goLedger() { wx.switchTab({ url: '/pages/ledger/ledger' }); },
});
