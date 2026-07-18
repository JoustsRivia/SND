// pkg-system/pages/dict/dict.js —— M13.2 字典与检查表模板管理
// 字典项支持增/删/改；检查表模板支持新增（受服务端 requireAdmin 保护）。
const api = require('../../../utils/api');
const network = require('../../../utils/network');

const DICT_TYPE = 'tool_category'; // 当前维护的字典类型

Page({
  data: {
    dict: [],          // [{ _id, type, key, label, value }]
    tpl: [],           // [{ _id, name, items? }]
    name: '', submitting: false,
  },

  async onLoad() { this.load(); },

  async load() {
    const dict = await api.getDict(DICT_TYPE).catch(() => null);
    const tpl = await api.manageCheckTemplate({ op: 'list' }).catch(() => null);
    this.setData({ dict: dict || [], tpl: tpl || [] });
  },

  bindName(e) { this.setData({ name: e.detail.value }); },

  // ── 字典项：新增 ────────────────────────────────────────────────
  async onAddDict() {
    try { await network.requireOnline(); } catch (e) { return; }
    wx.showModal({
      title: '新增字典项',
      editable: true,
      placeholderText: '字典项名称（如：绝缘安全工器具）',
      success: async (r) => {
        if (!r.confirm || !r.content) return;
        const label = r.content.trim();
        const key = label;
        this.setData({ submitting: true });
        try {
          await api.createDict({ type: DICT_TYPE, key, label, value: key });
          wx.showToast({ title: '已新增', icon: 'success' });
          await this.load();
        } catch (err) {
          wx.showToast({ title: (err && err.message) || '新增失败', icon: 'none' });
        } finally {
          this.setData({ submitting: false });
        }
      },
    });
  },

  // ── 字典项：编辑 ────────────────────────────────────────────────
  async onEditDict(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.dict.find((d) => d._id === id);
    if (!item) return;
    try { await network.requireOnline(); } catch (e) { return; }
    wx.showModal({
      title: '编辑字典项',
      editable: true,
      content: item.label,
      placeholderText: '字典项名称',
      success: async (r) => {
        if (!r.confirm || !r.content) return;
        const label = r.content.trim();
        this.setData({ submitting: true });
        try {
          await api.updateDict({ _id: id, type: DICT_TYPE, key: item.key, label, value: item.key });
          wx.showToast({ title: '已保存', icon: 'success' });
          await this.load();
        } catch (err) {
          wx.showToast({ title: (err && err.message) || '保存失败', icon: 'none' });
        } finally {
          this.setData({ submitting: false });
        }
      },
    });
  },

  // ── 字典项：删除 ────────────────────────────────────────────────
  async onRemoveDict(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.dict.find((d) => d._id === id);
    if (!item) return;
    const ok = await new Promise((resolve) => wx.showModal({
      title: '删除字典项',
      content: '确认删除「' + item.label + '」？',
      success: (r) => resolve(r.confirm),
    }));
    if (!ok) return;
    try { await network.requireOnline(); } catch (e) { return; }
    this.setData({ submitting: true });
    try {
      await api.removeDict(id);
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.load();
    } catch (err) {
      wx.showToast({ title: (err && err.message) || '删除失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // ── 检查表模板：新增 ────────────────────────────────────────────
  async onAdd() {
    const name = this.data.name;
    if (!name) {
      wx.showToast({ title: '请输入模板名称', icon: 'none' });
      return;
    }
    try { await network.requireOnline(); } catch (e) { return; }
    this.setData({ submitting: true });
    try {
      await api.manageCheckTemplate({ op: 'add', data: { name, items: [] } });
      wx.showToast({ title: '已新增模板', icon: 'success' });
      this.setData({ name: '' });
      await this.load();
    } catch (err) {
      wx.showToast({ title: (err && err.message) || '新增失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
