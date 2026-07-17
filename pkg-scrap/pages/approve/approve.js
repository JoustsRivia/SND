// pkg-scrap/pages/approve/approve.js —— M8.1.3 报废审批
const api = require('../../../utils/api');

Page({
  data: { list: [], loading: true },
  async onLoad() { this.load(); },
  async load() {
    const r = await api.getScrapList({ status: 'pending' }).catch(() => []);
    this.setData({ list: r || [], loading: false });
  },
  async onPass(e) { await api.approveScrap(e.currentTarget.dataset.id, true); this.load(); },
  async onReject(e) { await api.approveScrap(e.currentTarget.dataset.id, false); this.load(); },
});
