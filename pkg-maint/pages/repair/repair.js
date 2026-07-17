// pkg-maint/pages/repair/repair.js —— M7 报修处理（通过 / 维修登记 / 复检）
const api = require('../../../utils/api');
const network = require('../../../utils/network');

Page({
  data: {
    list: [],        // [{ _id, toolId, fault, desc, status, reporter }]
    selectedId: '',
    loading: true,
  },

  async onLoad() {
    await this.reload();
  },

  async reload() {
    const list = await api.getRepairList({}).catch(() => []);
    this.setData({ list: list || [], loading: false });
  },

  onTap(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedId: this.data.selectedId === id ? '' : id });
  },

  getSelected() {
    return this.data.list.find((it) => it._id === this.data.selectedId);
  },

  async onApprove() {
    try { await network.requireOnline(); } catch (e) { return; }
    const it = this.getSelected();
    if (!it) return;
    try {
      await api.approveRepair(it._id);
      wx.showToast({ title: '已通过', icon: 'success' });
      await this.reload();
      this.setData({ selectedId: '' });
    } catch (err) { wx.showToast({ title: '操作失败', icon: 'none' }); }
  },

  async onRecord() {
    try { await network.requireOnline(); } catch (e) { return; }
    const it = this.getSelected();
    if (!it) return;
    const d1 = await wx.showModal({ title: '维修登记', editable: true, placeholderText: '维修内容 / 处理措施' });
    if (!d1.confirm) return;
    const repairDetail = (d1.content || '').trim();
    if (!repairDetail) { wx.showToast({ title: '请填写维修内容', icon: 'none' }); return; }
    const d2 = await wx.showModal({ title: '维修费用', editable: true, placeholderText: '费用（元），可留空' });
    if (!d2.confirm) return;
    const cost = (d2.content || '').trim();
    try {
      await api.recordRepair({ id: it._id, repairDetail, cost });
      wx.showToast({ title: '已登记', icon: 'success' });
      await this.reload();
      this.setData({ selectedId: '' });
    } catch (err) { wx.showToast({ title: '操作失败', icon: 'none' }); }
  },

  async onRecheck() {
    try { await network.requireOnline(); } catch (e) { return; }
    const it = this.getSelected();
    if (!it) return;
    try {
      await api.recheckRepair(it._id);
      wx.showToast({ title: '复检合格', icon: 'success' });
      await this.reload();
      this.setData({ selectedId: '' });
    } catch (err) { wx.showToast({ title: '操作失败', icon: 'none' }); }
  },
});
