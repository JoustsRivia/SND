// pkg-barcode/pages/batch/batch.js —— M14 批量生成条码
const api = require('../../../utils/api');
const network = require('../../../utils/network');

Page({
  data: { list: [], selected: [], result: null, generating: false },

  async onLoad() {
    const r = await api.getToolList({ size: 100 }).catch(() => []);
    this.setData({ list: r || [] });
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id;
    const sel = this.data.selected.slice();
    const i = sel.indexOf(id);
    if (i >= 0) sel.splice(i, 1); else sel.push(id);
    this.setData({ selected: sel });
  },

  async onGen() {
    const ids = this.data.selected;
    if (!ids.length) { wx.showToast({ title: '请选择器具', icon: 'none' }); return; }
    try { await network.requireOnline(); } catch (err) { return; }
    this.setData({ generating: true });
    try {
      const r = await api.batchGenBarcode(ids);
      this.setData({ result: r, generating: false });
      wx.showToast({ title: `已生成 ${r.count} 条`, icon: 'success' });
    } catch (err) {
      this.setData({ generating: false });
      wx.showToast({ title: '生成失败', icon: 'none' });
    }
  },
});
