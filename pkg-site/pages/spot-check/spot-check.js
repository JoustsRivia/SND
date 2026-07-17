// pkg-site/pages/spot-check/spot-check.js —— M6 现场点检
const api = require('../../../utils/api');
const network = require('../../../utils/network');

Page({
  data: {
    taskDate: '',
    items: [],        // [{ text, result }]
    toolId: '',
    abnormal: false,
    remark: '',
    submitting: false,
  },

  async onLoad(opts) {
    // 从每日点检汇总页 drill-down 带入的器具编号，预填到表单
    if (opts && opts.toolId) this.setData({ toolId: opts.toolId });
    const task = await api.getSpotCheckTask().catch(() => null);
    if (task && task.items) {
      const items = (task.items || []).map((t) => ({
        text: typeof t === 'string' ? t : (t.text || t.name || ''),
        result: '合格',
      }));
      this.setData({ taskDate: task.date || '', items });
    }
  },

  bindToolId(e) { this.setData({ toolId: e.detail.value }); },
  bindRemark(e) { this.setData({ remark: e.detail.value }); },
  onAbnormal(e) { this.setData({ abnormal: e.detail.value }); },

  onToggle(e) {
    const i = e.currentTarget.dataset.index;
    const items = this.data.items.slice();
    items[i] = Object.assign({}, items[i], { result: e.detail.value ? '合格' : '异常' });
    this.setData({ items });
  },

  async onSubmit() {
    try { await network.requireOnline(); } catch (e) { return; }
    if (!this.data.items.length) {
      wx.showToast({ title: '暂无可点检项', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    try {
      await api.submitSpotCheck({
        toolId: this.data.toolId,
        items: this.data.items,
        abnormal: this.data.abnormal,
        remark: this.data.remark,
      });
      wx.showToast({ title: '点检已提交', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    } catch (err) {
      wx.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
