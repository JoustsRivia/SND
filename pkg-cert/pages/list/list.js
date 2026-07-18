// pkg-cert/pages/list/list.js —— M9.2 持证管理（领用人自助维护）
const api = require('../../../utils/api');
const auth = require('../../../utils/auth');
const { CERT_TYPES, SPECIAL_EQUIP_CATEGORIES } = require('../../../utils/constants');

const typeName = (code) => (CERT_TYPES.find((c) => c.code === code) || {}).name || code;

Page({
  data: {
    list: [], loading: true, isAdmin: false,
    specialCats: SPECIAL_EQUIP_CATEGORIES,
  },

  onShow() { this.load(); },

  async load() {
    this.setData({ loading: true });
    const p = auth.getProfile();
    const isAdmin = p && ['lead', 'supervisor', 'admin'].includes(p.role);
    const r = await api.certList(isAdmin ? {} : {}).catch(() => null);
    const list = (r || []).map((c) => ({
      ...c,
      typeName: typeName(c.type),
      expired: c.status !== 'valid',
      expireShort: (c.expireAt || '').slice(0, 10),
    }));
    this.setData({ list, isAdmin, loading: false });
  },

  onAdd() { wx.navigateTo({ url: '/pkg-cert/pages/form/form' }); },
  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pkg-cert/pages/form/form?id=' + id });
  },
  async onDelete(e) {
    const id = e.currentTarget.dataset.id;
    const r = await wx.showModal({ title: '删除证书', content: '确认删除该证件记录？' });
    if (!r.confirm) return;
    await api.deleteCert(id).catch(() => {});
    this.load();
  },
  onBack() { wx.navigateBack(); },
});
