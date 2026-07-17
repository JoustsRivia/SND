// pkg-stats/pages/six-standard/six-standard.js —— M12.2 六化达标分析
const api = require('../../../utils/api');

Page({
  data: { dims: [], loading: true },

  async onLoad() {
    const r = await api.getSixStandard().catch(() => null);
    this.setData({ dims: (r && r.dims) || [], loading: false });
  },
});
