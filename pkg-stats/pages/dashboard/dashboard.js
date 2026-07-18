// pkg-stats/pages/dashboard/dashboard.js —— M12.1 统计分析看板
const api = require('../../../utils/api');

Page({
  data: { loading: true, items: [], trend: [], maxTrend: 1 },

  async onLoad() {
    const d = await api.getDashboard().catch(() => null);
    if (d) {
      this.setData({
        items: [
          { label: '器具总数', value: d.total, color: 'var(--c-primary)' },
          { label: '合格', value: d.qualified, color: 'var(--c-success)' },
          { label: '待检', value: d.pendingTest, color: 'var(--c-warning)' },
          { label: '报废', value: d.scrapped, color: 'var(--c-danger)' },
          { label: '维修中', value: d.maintaining },
          { label: '超期预警', value: d.expiringSoon },
          { label: '未读预警', value: d.warnings, color: 'var(--c-danger)' },
        ],
      });
    }
    const t = await api.getTrend({ days: 7 }).catch(() => []);
    const trend = (t || []).map((x) => ({ date: (x.date || '').slice(5), total: x.total || 0 }));
    const maxTrend = Math.max(1, ...trend.map((x) => x.total));
    this.setData({ trend, maxTrend, loading: false });
  },

  goSix() { wx.navigateTo({ url: '/pkg-stats/pages/six-standard/six-standard' }); },
  goReport() { wx.navigateTo({ url: '/pkg-stats/pages/report/report' }); },
});
