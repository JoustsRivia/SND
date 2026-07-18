// pkg-ledger/pages/reconcile/reconcile.js —— M1.4 账物核对
const api = require('../../../utils/api');
const network = require('../../../utils/network');

const RESULT = {
  pending: { text: '待核对', cls: 'gray' },
  match: { text: '相符', cls: 'ok' },
  loss: { text: '盘亏', cls: 'warn' },
  surplus: { text: '盘盈', cls: 'info' },
  abnormal: { text: '异常', cls: 'bad' },
};
const RESULT_KEYS = ['match', 'loss', 'surplus', 'abnormal'];

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

Page({
  data: {
    tab: 'task',
    tasks: [], diffs: [], loading: true,
    taskDetail: null,
    RESULT, RESULT_KEYS,
  },

  async onLoad() { await this.loadTasks(); },
  async onPullDownRefresh() { await this.refresh(); wx.stopPullDownRefresh(); },

  async refresh() {
    if (this.data.tab === 'task') await this.loadTasks();
    else await this.loadDiff();
  },

  onTab(e) {
    const tab = e.currentTarget.dataset.v;
    this.setData({ tab });
    if (tab === 'task') this.loadTasks();
    else this.loadDiff();
  },

  async loadTasks() {
    this.setData({ loading: true });
    const list = await api.getReconcileList({}).catch(() => []);
    const mapped = (list || []).map((t) => ({
      ...t, _status: t.status === 'done' ? '已完成' : '核对中',
      _statusCls: t.status === 'done' ? 'ok' : 'warn',
    }));
    this.setData({ tasks: mapped, loading: false });
  },

  async loadDiff() {
    this.setData({ loading: true });
    const rows = await api.getReconcileDiff({}).catch(() => []);
    const mapped = (rows || []).map((r) => ({ ...r, _result: RESULT[r.result] || RESULT.pending }));
    this.setData({ diffs: mapped, loading: false });
  },

  async onCreate() {
    try { await network.requireOnline(); } catch (err) { return; }
    wx.showLoading({ title: '生成中' });
    try {
      await api.createReconcileTask({ month: thisMonth() });
      wx.showToast({ title: '已生成月度核对', icon: 'success' });
      await this.loadTasks();
    } catch (err) {
      wx.showToast({ title: err.message || '生成失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async onOpenTask(e) {
    const id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '' });
    try {
      const task = await api.getReconcileTask(id);
      this.setData({
        taskDetail: {
          ...task,
          items: (task.items || []).map((it) => ({ ...it, _result: RESULT[it.result] || RESULT.pending })),
        },
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async onSetResult(e) {
    const { itemId, result } = e.currentTarget.dataset;
    const task = this.data.taskDetail;
    if (!task || task.status === 'done') return;
    wx.showLoading({ title: '' });
    try {
      await api.confirmReconcileItem({ id: task._id, itemId, result });
      const task2 = await api.getReconcileTask(task._id);
      this.setData({
        taskDetail: {
          ...task2,
          items: (task2.items || []).map((it) => ({ ...it, _result: RESULT[it.result] || RESULT.pending })),
        },
      });
    } catch (err) {
      wx.showToast({ title: '更新失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async onFinish() {
    const task = this.data.taskDetail;
    if (!task) return;
    try { await network.requireOnline(); } catch (err) { return; }
    wx.showModal({
      title: '完成核对', content: '完成后将生成差异清单并锁定任务，确认？',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '提交中' });
        try {
          await api.finishReconcileTask(task._id);
          wx.showToast({ title: '已提交', icon: 'success' });
          this.setData({ taskDetail: null });
          await this.loadTasks();
        } catch (err) {
          wx.showToast({ title: '提交失败', icon: 'none' });
        } finally {
          wx.hideLoading();
        }
      },
    });
  },

  onCloseDetail() { this.setData({ taskDetail: null }); },
});
