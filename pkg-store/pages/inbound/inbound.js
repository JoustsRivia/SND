// pkg-store/pages/inbound/inbound.js —— M3.2.1 入库登记
const api = require('../../../utils/api');
const network = require('../../../utils/network');

Page({
  data: {
    tools: [], idx: 0,
    storeName: '', zone: '', shelf: '', submitting: false,
  },

  async onLoad() {
    const r = await api.getToolList({ size: 200 }).catch(() => []);
    this.setData({ tools: r || [], idx: (r && r.length) ? 0 : -1 });
  },

  onPick(e) { this.setData({ idx: +e.detail.value }); },
  bindStore(e) { this.setData({ storeName: e.detail.value }); },
  bindZone(e) { this.setData({ zone: e.detail.value }); },
  bindShelf(e) { this.setData({ shelf: e.detail.value }); },

  async onSubmit() {
    try { await network.requireOnline(); } catch (e) { return; }
    const t = this.data.tools[this.data.idx];
    if (!t) { wx.showToast({ title: '请选择器具', icon: 'none' }); return; }
    if (!this.data.storeName) { wx.showToast({ title: '请填写库房', icon: 'none' }); return; }
    this.setData({ submitting: true });
    try {
      await api.inbound({
        toolId: t._id, code: t.code, name: t.name,
        storeName: this.data.storeName, zone: this.data.zone, shelf: this.data.shelf,
      });
      wx.showToast({ title: '已入库', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 600);
    } catch (err) {
      wx.showToast({ title: '入库失败', icon: 'none' });
    } finally { this.setData({ submitting: false }); }
  },
});
