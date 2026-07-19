// pkg-scrap/pages/approve/approve.js —— M8.1.3 报废审批
const api = require('../../../utils/api');
const { buildFlow } = require('../../../utils/flow');

Page({
  data: { list: [], selectedId: '', loading: true, acting: false },
  async onLoad() { this.load(); },
  async load() {
    this.setData({ loading: true });
    const r = await api.getScrapList({ status: 'pending' }).catch(() => []);
    // 注入流程阶段（申请→审批→处置），让审批进度被感知
    const list = (r || []).map((it) => ({ ...it, flow: buildFlow('scrap', it.status) }));
    this.setData({ list, selectedId: '', loading: false });
  },
  onTap(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedId: this.data.selectedId === id ? '' : id });
  },
  async onPass(e) {
    if (this.data.acting) return;
    const id = e.currentTarget.dataset.id;
    this.setData({ acting: true });
    try {
      await api.approveScrap(id, true);
      wx.showToast({ title: '已通过', icon: 'success' });
      await this.load();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    } finally { this.setData({ acting: false }); }
  },
  async onReject(e) {
    if (this.data.acting) return;
    const id = e.currentTarget.dataset.id;
    this.setData({ acting: true });
    try {
      await api.approveScrap(id, false);
      wx.showToast({ title: '已驳回', icon: 'none' });
      await this.load();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    } finally { this.setData({ acting: false }); }
  },
});
