// pages/message/message.js —— 消息中心（M11 站内消息 + 预警）
const api = require('../../utils/api');
const auth = require('../../utils/auth');

const LEVEL_META = {
  urgent:   { label: '紧急', cls: 'danger', icon: '⛔' },
  important: { label: '重要', cls: 'warning', icon: '⚠️' },
  notice:   { label: '通知', cls: 'info',    icon: '📢' },
};

const TABS = [
  { key: '', label: '全部' },
  { key: 'notice', label: '通知' },
  { key: 'important', label: '重要' },
  { key: 'urgent', label: '紧急' },
];

function fmtTime(ts) {
  if (!ts) return '';
  const d = (ts instanceof Date) ? ts : new Date(ts);
  if (isNaN(d.getTime())) return '';
  const p = (n) => (n < 10 ? '0' + n : '' + n);
  return `${d.getMonth() + 1}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

Page({
  data: {
    list: [], raw: [],
    tabs: TABS, activeTab: '',
    stats: [],
    hasUnread: false,
    loading: true,
  },

  onLoad() { this.load(); },
  onPullDownRefresh() { this.load().then(() => wx.stopPullDownRefresh()); },
  onShow() {
    if (!auth.isLoggedIn()) { wx.reLaunch({ url: '/pages/login/login' }); return; }
    if (!this.data.loading) this.load();
  },

  async load() {
    const res = await api.getWarnings({ page: 1, size: 30 }).catch(() => []);
    const raw = res || [];
    this.setData({ raw });
    this.applyFilter();
  },

  applyFilter() {
    const { raw, activeTab } = this.data;
    const list = (activeTab ? raw.filter((m) => m.level === activeTab) : raw).map((m) => {
      const meta = LEVEL_META[m.level] || LEVEL_META.notice;
      return { ...m, _cls: meta.cls, _icon: meta.icon, _time: fmtTime(m.createdAt || m.time) };
    });
    const counts = { '': raw.length, notice: 0, important: 0, urgent: 0 };
    raw.forEach((m) => { if (counts[m.level] != null) counts[m.level]++; });
    const tabs = this.data.tabs.map((t) => ({ ...t, count: counts[t.key] }));
    let unread = 0, warn = 0;
    raw.forEach((m) => { if (!m.read) unread++; if (m.level === 'urgent' || m.level === 'important') warn++; });
    this.setData({
      list,
      tabs,
      hasUnread: unread > 0,
      stats: [
        { label: '未读', value: unread, color: 'var(--c-danger)' },
        { label: '重要/紧急', value: warn, color: 'var(--c-warning)' },
        { label: '总计', value: raw.length, color: 'var(--c-primary)' },
      ],
      loading: false,
    });
  },

  onTab(e) {
    this.setData({ activeTab: e.detail.key });
    this.applyFilter();
  },

  onRead(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    api.readWarning(id).catch(() => {});
    const raw = this.data.raw.map((m) => (m._id === id ? { ...m, read: true } : m));
    this.setData({ raw });
    this.applyFilter();
  },

  onMarkAll() {
    if (!this.data.hasUnread) return;
    api.readAllWarnings().catch(() => {});
    const raw = this.data.raw.map((m) => ({ ...m, read: true }));
    wx.showToast({ title: '已全部标记已读', icon: 'success' });
    this.setData({ raw });
    this.applyFilter();
  },

  // 触发预警自动生成（M11.1）：扫描试验到期/超期、证书到期、隐患超期、报废异动
  async onGenerate() {
    wx.showLoading({ title: '生成预警中' });
    const r = await api.generateWarnings().catch(() => ({ generated: 0 }));
    wx.hideLoading();
    const n = (r && r.generated) || 0;
    wx.showToast({ title: n > 0 ? `新生成 ${n} 条预警` : '暂无新增预警', icon: n > 0 ? 'success' : 'none' });
    this.load();
  },
});
