// pkg-scrap/pages/apply/apply.js —— M8.1.2 报废申请 + M8.1.1 强制报废自动判定
const api = require('../../../utils/api');
const network = require('../../../utils/network');

// 强制报废 7 项判定（与 cloudfunctions/scrap/index.js SCRAP_RULES 对应）
const RULES = [
  { key: 'breakdown', label: '绝缘击穿' },
  { key: 'deformation', label: '严重变形' },
  { key: 'crack', label: '裂纹损伤' },
  { key: 'aging', label: '老化失效' },
  { key: 'over_life', label: '超过使用年限' },
  { key: 'failed_test', label: '检验不合格' },
  { key: 'unrepairable', label: '无法修复' },
];

Page({
  data: {
    candidates: [], idx: 0,
    reason: '', photos: [], submitting: false,
    rules: RULES, symptoms: [], judge: null,
  },

  async onLoad() {
    const r = await api.autoScrapCheck().catch(() => null);
    const candidates = (r && r.candidates) || [];
    this.setData({ candidates, idx: candidates.length ? 0 : -1 });
    if (candidates.length) this.runJudge();
  },

  onPick(e) {
    this.setData({ idx: +e.detail.value, symptoms: [], judge: null });
    this.runJudge();
  },

  bindReason(e) { this.setData({ reason: e.detail.value }); },

  // M8.1.1 强制报废自动判定：基于器具状态/年限/试验 + 勾选症状
  async runJudge() {
    const c = this.data.candidates[this.data.idx];
    if (!c) return;
    const r = await api.judgeScrap(c._id, this.data.symptoms).catch(() => null);
    if (r) this.setData({ judge: r });
  },

  toggleSymptom(e) {
    const key = e.currentTarget.dataset.k;
    const set = new Set(this.data.symptoms);
    set.has(key) ? set.delete(key) : set.add(key);
    this.setData({ symptoms: [...set] });
    this.runJudge();
  },

  async onPhoto() {
    const m = await wx.chooseMedia({ count: 3, mediaType: ['image'] });
    const ids = [];
    for (const f of m.tempFiles) ids.push(await api.uploadFile(f.tempFilePath, 'image'));
    this.setData({ photos: this.data.photos.concat(ids) });
  },

  async onSubmit() {
    try { await network.requireOnline(); } catch (e) { return; }
    const c = this.data.candidates[this.data.idx];
    if (!c) { wx.showToast({ title: '请选择器具', icon: 'none' }); return; }
    this.setData({ submitting: true });
    try {
      const r = await api.submitScrap({ id: c._id, reason: this.data.reason, photos: this.data.photos, symptoms: this.data.symptoms });
      const must = r && r.mustScrap;
      wx.showModal({
        title: '已提交审批',
        content: must ? '系统判定为强制报废（' + ((r && r.reasons) || []).join('、') + '），已上报待审批。' : '已提交报废审批，等待安全员/项目部审批。',
        showCancel: false,
        success: () => wx.navigateBack(),
      });
    } catch (err) {
      wx.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
