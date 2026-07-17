// pkg-purchase/pages/approve/approve.js —— M2.2 采购审批
const api = require('../../../utils/api');
const network = require('../../../utils/network');

Page({
  data: {
    list: [],
    records: [],
    loading: true,
    processing: '',
  },

  async onLoad() { await this.load(); },
  async onShow() { await this.load(); },

  async load() {
    this.setData({ loading: true });
    const list = await api.getPurchaseList({ status: 'pending' }).catch(() => []);
    const records = (list || []).map((it) => ({
      time: it.createdAt,
      title: it.name,
      desc: '数量 ' + it.qty + ' 预算 ' + it.budget,
      operator: it.applicant,
      status: it.status,
    }));
    this.setData({ list: list || [], records, loading: false });
  },

  async onDecision(e) {
    try { await network.requireOnline(); } catch (err) { return; }
    const { id, pass } = e.currentTarget.dataset;
    if (this.data.processing) return;
    this.setData({ processing: id });
    try {
      await api.approvePurchase(id, pass);
      wx.showToast({ title: pass ? '已通过' : '已驳回', icon: 'success' });
      await this.load();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      this.setData({ processing: '' });
    }
  },
});
