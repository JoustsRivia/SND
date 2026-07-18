// pkg-barcode/pages/batch/batch.js —— M14.2 批量操作（生成条码/入库/点检）
const api = require('../../../utils/api');
const network = require('../../../utils/network');

const MODES = [
  { key: 'gen', label: '批量生成条码', fn: 'batchGenBarcode', ok: '已生成' },
  { key: 'inbound', label: '批量入库', fn: 'batchInbound', ok: '已入库' },
  { key: 'spot', label: '批量点检', fn: 'batchSpotCheck', ok: '已点检' },
];

Page({
  data: { list: [], selected: [], modeIdx: 0, modes: MODES, result: null, doing: false },

  async onLoad() {
    const r = await api.getToolList({ size: 200 }).catch(() => []);
    this.setData({ list: r || [] });
  },

  onMode(e) { this.setData({ modeIdx: +e.detail.value, result: null }); },

  onToggle(e) {
    const id = e.currentTarget.dataset.id;
    const sel = this.data.selected.slice();
    const i = sel.indexOf(id);
    if (i >= 0) sel.splice(i, 1); else sel.push(id);
    this.setData({ selected: sel });
  },

  async onExec() {
    const ids = this.data.selected;
    if (!ids.length) { wx.showToast({ title: '请选择器具', icon: 'none' }); return; }
    try { await network.requireOnline(); } catch (err) { return; }
    const m = this.data.modes[this.data.modeIdx];
    this.setData({ doing: true });
    try {
      const r = await api[m.fn](ids);
      this.setData({ result: r, doing: false });
      wx.showToast({ title: `${m.ok} ${r.count || ids.length} 条`, icon: 'success' });
    } catch (err) {
      this.setData({ doing: false });
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },
});
