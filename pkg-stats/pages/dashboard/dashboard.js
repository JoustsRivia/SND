// pkg-stats/pages/dashboard/dashboard.js —— M12.1 统计分析看板
const api = require('../../../utils/api');

Page({
  data: { loading: true, items: [] },

  async onLoad() {
    const d = await api.getDashboard().catch(() => null);
    if (!d) { this.setData({ loading: false }); return; }
    const items = [
      { label: '器具总数', value: d.total, color: 'var(--color-primary)' },
      { label: '合格', value: d.qualified, color: 'var(--color-success)' },
      { label: '待检', value: d.pendingTest, color: 'var(--color-warning)' },
      { label: '报废', value: d.scrapped, color: 'var(--color-danger)' },
      { label: '维修中', value: d.maintaining },
      { label: '超期预警', value: d.expiringSoon },
      { label: '未读预警', value: d.warnings, color: 'var(--color-danger)' },
    ];
    this.setData({ items, loading: false });
  },
});
