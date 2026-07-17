// pkg-ledger/pages/lease/lease.js —— M1.3.7 租赁机具专项管理
const api = require('../../../utils/api');
const { TOOL_CATEGORIES } = require('../../../utils/constants');

Page({
  data: {
    list: [], loading: true, showAdd: false,
    categories: TOOL_CATEGORIES, catIndex: 6, // 默认大型租赁机具
    form: { name: '', leaseUnit: '', certNo: '', operator: '', operatorCert: '' },
  },

  async onLoad() { this.load(); },
  async load() {
    const res = await api.getLeaseList().catch(() => []);
    this.setData({ list: res || [], loading: false });
  },
  toggleAdd() { this.setData({ showAdd: !this.data.showAdd }); },
  onCat(e) { this.setData({ catIndex: +e.detail.value }); },
  bind(e) { this.setData({ ['form.' + e.currentTarget.dataset.k]: e.detail.value }); },

  async onAdd() {
    const f = this.data.form;
    if (!f.name || !f.leaseUnit) {
      wx.showToast({ title: '请填名称与租赁单位', icon: 'none' });
      return;
    }
    await api.createLease({
      category: this.data.categories[this.data.catIndex].code,
      source: 'lease', ...f,
    });
    this.setData({ showAdd: false, form: { name: '', leaseUnit: '', certNo: '', operator: '', operatorCert: '' } });
    this.load();
  },
});
