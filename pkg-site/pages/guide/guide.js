// pkg-site/pages/guide/guide.js —— M6 操作规程指引
const api = require('../../../utils/api');

Page({
  data: {
    list: [],       // [{ _id, title, category, content }]
    selectedId: '',
    loading: true,
  },

  async onLoad() {
    const list = await api.getOpGuide().catch(() => []);
    this.setData({ list: list || [], loading: false });
  },

  onTap(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedId: this.data.selectedId === id ? '' : id });
  },
});
