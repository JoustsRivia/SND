// pkg-check/pages/hazard/hazard.js —— M10.2 隐患管理
const api = require('../../../utils/api');
const network = require('../../../utils/network');
const { HAZARD_LEVEL } = require('../../../utils/constants');

const LEVELS = [
  { key: HAZARD_LEVEL.NORMAL, label: '一般' },
  { key: HAZARD_LEVEL.SERIOUS, label: '严重' },
  { key: HAZARD_LEVEL.MAJOR, label: '重大' },
];

const HAZARD_STATUS = { open: '待整改', tracking: '跟踪中', closed: '已闭环' };

Page({
  data: {
    desc: '', levelIdx: 0, location: '',
    levelLabels: LEVELS.map((l) => l.label),
    list: [], loading: true, submitting: false,
  },

  async onLoad() {
    // 登录守卫：未登录跳登录页
    let profile = null;
    try { profile = await api.getMyProfile(); } catch (e) { profile = null; }
    if (!profile || !profile.bound) { wx.reLaunch({ url: '/pages/login/login' }); return; }
    await this.loadList();
  },
  async onPullDownRefresh() { await this.loadList(); wx.stopPullDownRefresh(); },

  async loadList() {
    this.setData({ loading: true });
    const list = await api.getHazardList({}).catch(() => []);
    const mapped = (list || []).map((it) => ({
      ...it,
      _statusText: HAZARD_STATUS[it.status] || it.status || '未知',
      _assignee: it.assignee || '',
      _dueDate: it.dueDate || '',
      _records: (it.trackLogs || []).map((log) => ({
        time: log.time || '',
        title: it.desc,
        desc: log.note || log.progressNote || '',
        operator: log.operator || '',
        status: 'normal',
      })),
    }));
    this.setData({ list: mapped, loading: false });
  },

  onPickLevel(e) { this.setData({ levelIdx: +e.detail.value }); },
  bindDesc(e) { this.setData({ desc: e.detail.value }); },
  bindLocation(e) { this.setData({ location: e.detail.value }); },

  // 子功能入口：现场检查 / 考核评比
  onGo(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }); },

  async onSubmit() {
    const desc = this.data.desc.trim();
    const location = this.data.location.trim();
    if (!desc || !location) {
      wx.showToast({ title: '请填写描述与位置', icon: 'none' });
      return;
    }
    try { await network.requireOnline(); } catch (err) { return; }
    this.setData({ submitting: true });
    try {
      await api.reportHazard({ desc, level: LEVELS[this.data.levelIdx].key, location });
      wx.showToast({ title: '已上报', icon: 'success' });
      this.setData({ desc: '', location: '', levelIdx: 0 });
      await this.loadList();
    } catch (err) {
      wx.showToast({ title: '上报失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  async onTapHazard(e) {
    const item = e.currentTarget.dataset.item;
    const r = await wx.showActionSheet({ itemList: ['指派整改人', '跟踪进度', '闭环隐患', '取消'] }).catch(() => null);
    if (!r || r.tapIndex === 3) return;
    try { await network.requireOnline(); } catch (err) { return; }
    if (r.tapIndex === 0) {
      await this.onAssign(item);
    } else if (r.tapIndex === 1) {
      const m = await wx.showModal({ title: '跟踪进度', editable: true, placeholderText: '请输入进度说明', content: '' });
      if (!m.confirm) return;
      const progressNote = (m.content || '').trim();
      if (!progressNote) { wx.showToast({ title: '请输入进度说明', icon: 'none' }); return; }
      await api.trackHazard(item._id, { progressNote });
      wx.showToast({ title: '已跟踪', icon: 'success' });
    } else if (r.tapIndex === 2) {
      await api.closeHazard(item._id);
      wx.showToast({ title: '已闭环', icon: 'success' });
    }
    await this.loadList();
  },

  // M10.2.3 隐患指派整改人 + 整改期限
  async onAssign(item) {
    const a = await wx.showModal({ title: '指派整改人', editable: true, placeholderText: '整改责任人姓名/工号', content: item._assignee || '' }).catch(() => null);
    if (!a || !a.confirm) return;
    const assignee = (a.content || '').trim();
    if (!assignee) { wx.showToast({ title: '请填写责任人', icon: 'none' }); return; }
    const d = await wx.showModal({ title: '整改期限', editable: true, placeholderText: 'YYYY-MM-DD', content: item._dueDate || '' }).catch(() => null);
    if (!d || !d.confirm) return;
    const dueDate = (d.content || '').trim();
    await api.assignHazard(item._id, { assignee, dueDate });
    wx.showToast({ title: '已指派', icon: 'success' });
  },
});
