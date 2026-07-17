// pkg-purchase/pages/apply/apply.js —— M2.1 采购申请
const api = require('../../../utils/api');
const network = require('../../../utils/network');
const { TOOL_CATEGORIES } = require('../../../utils/constants');

Page({
  data: {
    name: '',
    categories: TOOL_CATEGORIES,
    catIdx: 0,
    qty: '',
    budget: '',
    reason: '',
    expectDate: '',
    submitting: false,
  },

  bindName(e) { this.setData({ name: e.detail.value }); },
  onPickCategory(e) { this.setData({ catIdx: +e.detail.value }); },
  bindQty(e) { this.setData({ qty: e.detail.value }); },
  bindBudget(e) { this.setData({ budget: e.detail.value }); },
  bindReason(e) { this.setData({ reason: e.detail.value }); },
  onPickDate(e) { this.setData({ expectDate: e.detail.value }); },

  async onSubmit() {
    try { await network.requireOnline(); } catch (e) { return; }
    const { name, categories, catIdx, qty, budget, reason, expectDate } = this.data;
    if (!name) { wx.showToast({ title: '请填写器具名称', icon: 'none' }); return; }
    if (!qty || +qty <= 0) { wx.showToast({ title: '请填写有效数量', icon: 'none' }); return; }
    if (!budget || +budget <= 0) { wx.showToast({ title: '请填写有效预算', icon: 'none' }); return; }
    this.setData({ submitting: true });
    try {
      await api.createPurchase({
        name,
        category: categories[catIdx].code,
        qty: +qty,
        budget: +budget,
        reason,
        expectDate,
      });
      wx.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    } catch (err) {
      wx.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
