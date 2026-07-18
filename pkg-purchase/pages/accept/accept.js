// pkg-purchase/pages/accept/accept.js —— M2.2 进场三步验收
// 后端 purchase.accept 已实现：arrive(到货) -> unpack(开箱) -> archive(建档入库)
const api = require('../../../utils/api');
const network = require('../../../utils/network');

const STEPS = [
  { key: 'arrive', label: '外观检查', desc: '检查包装与器具外观是否完好、配件齐全' },
  { key: 'unpack', label: '性能检测', desc: '通电/空载试运行，确认功能正常' },
  { key: 'archive', label: '试验合格', desc: '核对出厂/型式试验报告，确认合格可入库' },
];

Page({
  data: {
    purchases: [], idx: 0,
    steps: STEPS.map((s) => ({ ...s, pass: true, remark: '' })),
    submitting: false,
  },

  async onLoad() {
    const r = await api.getPurchaseList({ status: 'approved' }).catch(() => null);
    const purchases = (r || []).filter((p) => p.status === 'approved');
    this.setData({ purchases, idx: purchases.length ? 0 : -1 });
  },

  onPick(e) { this.setData({ idx: +e.detail.value }); },
  onPass(e) {
    const i = +e.currentTarget.dataset.i;
    const steps = this.data.steps;
    steps[i].pass = !steps[i].pass;
    this.setData({ steps });
  },
  bindRemark(e) {
    const i = +e.currentTarget.dataset.i;
    const steps = this.data.steps;
    steps[i].remark = e.detail.value;
    this.setData({ steps });
  },

  async onSubmit() {
    try { await network.requireOnline(); } catch (err) { return; }
    const p = this.data.purchases[this.data.idx];
    if (!p) { wx.showToast({ title: '请选择采购单', icon: 'none' }); return; }
    const failStep = this.data.steps.find((s) => !s.pass);
    if (failStep) {
      wx.showModal({
        title: '验收不合格',
        content: `「${failStep.label}」未通过，器具禁止入库并应退回供应商。`,
        showCancel: false,
      });
      return;
    }
    this.setData({ submitting: true });
    try {
      const inspector = (this.data.purchases[this.data.idx].inspector) || '';
      for (const s of this.data.steps) {
        await api.createAcceptance({ purchaseId: p._id, step: s.key, result: { pass: s.pass, remark: s.remark }, inspector });
      }
      wx.showModal({
        title: '验收完成', content: '三步验收均合格，已建档入库。', showCancel: false,
        success: () => wx.navigateBack(),
      });
    } catch (err) {
      wx.showToast({ title: '提交失败', icon: 'none' });
    } finally { this.setData({ submitting: false }); }
  },
});
