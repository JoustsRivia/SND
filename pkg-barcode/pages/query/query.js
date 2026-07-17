// pkg-barcode/pages/query/query.js —— M14.1.3 扫码查询（防伪/状态）
const api = require('../../../utils/api');
const network = require('../../../utils/network');

Page({
  data: { code: '', result: null },
  onInput(e) { this.setData({ code: e.detail.value }); },

  async onScan() {
    try { await network.requireOnline(); } catch (e) { return; }
    wx.scanCode({
      success: async (res) => { this.query(res.result); },
    });
  },

  async onQuery() {
    if (!this.data.code) { wx.showToast({ title: '请输入或扫描编码', icon: 'none' }); return; }
    this.query(this.data.code);
  },

  async query(code) {
    const r = await api.verifyTestTag(code).catch(() => null);
    this.setData({ result: r });
  },
});
