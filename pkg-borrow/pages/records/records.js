// pkg-borrow/pages/records/records.js —— M5.1.4 / M5.2.3 领用归还记录
const api = require('../../../utils/api');

Page({
  data: {
    type: 'all',
    tabs: [{ v: 'all', n: '全部' }, { v: 'borrow', n: '领用' }, { v: 'return', n: '归还' }],
    list: [], loading: true,
  },

  async onLoad() { this.load(); },
  async load() {
    const t = this.data.type === 'all' ? undefined : this.data.type;
    const res = await api.getBorrowRecords({ type: t }).catch(() => []);
    this.setData({ list: res || [], loading: false });
  },
  onTab(e) {
    this.setData({ type: e.currentTarget.dataset.v });
    this.load();
  },
});
