// pkg-barcode/pages/print/print.js —— M14 打印文件输出
const api = require('../../../utils/api');

Page({
  data: { list: [], idx: 0, label: null },

  async onLoad() {
    const r = await api.getToolList({ size: 100 }).catch(() => []);
    this.setData({ list: r || [] });
  },
  onPick(e) { this.setData({ idx: +e.detail.value, label: null }); },

  async onPrint() {
    const t = this.data.list[this.data.idx];
    if (!t) { wx.showToast({ title: '请选择器具', icon: 'none' }); return; }
    const r = await api.getBarcodeFile(t._id).catch(() => null);
    this.setData({ label: r && r.fields });
  },

  onDoPrint() {
    if (!this.data.label) return;
    wx.showModal({
      title: '打印标签',
      content: '已生成标签打印文件，请通过蓝牙 / 云打印服务输出标签纸。',
      showCancel: false, confirmText: '我知道了',
    });
  },
});
