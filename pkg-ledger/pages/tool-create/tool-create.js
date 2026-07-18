// pkg-ledger/pages/tool-create/tool-create.js —— M1.3.1 新增录入 / M1.3.4 信息编辑
const api = require('../../../utils/api');
const network = require('../../../utils/network');
const { TOOL_CATEGORIES } = require('../../../utils/constants');

Page({
  data: {
    id: '', editMode: false,
    categories: TOOL_CATEGORIES,
    catIndex: 0,
    sources: [{ value: 'self', name: '自购' }, { value: 'lease', name: '租赁' }],
    sourceIndex: 0,
    form: {
      name: '', spec: '', factoryNo: '', purchaseDate: '',
      testPeriod: 6, lastTestDate: '', expireAt: '', store: '', keeper: '', source: 'self',
      leaseUnit: '', certNo: '', operator: '', operatorCert: '', // M1.3.7 租赁字段
      attachments: [], // M1.3.5 附件（合同/合格证/试验报告）
    },
    submitting: false,
  },

  onLoad(opts) {
    if (opts.id) {
      this.setData({ id: opts.id, editMode: true });
      this.prefill(opts.id);
    }
  },

  // 编辑模式：拉取档案回填（M1.3.4）
  async prefill(id) {
    const t = await api.getToolDetail(id).catch(() => null);
    if (!t) return;
    const catIndex = Math.max(0, this.data.categories.findIndex((c) => c.code === t.category));
    const sourceIndex = t.source === 'lease' ? 1 : 0;
    this.setData({
      catIndex, sourceIndex,
      form: {
        name: t.name || '', spec: t.spec || '', factoryNo: t.factoryNo || '',
        purchaseDate: t.purchaseDate || '', testPeriod: t.testPeriod || 6,
        lastTestDate: t.lastTestDate || '', expireAt: t.expireAt || '',
        store: t.store || '', keeper: t.keeper || '', source: t.source || 'self',
        leaseUnit: t.leaseUnit || '', certNo: t.certNo || '', operator: t.operator || '', operatorCert: t.operatorCert || '',
        attachments: t.attachments || [],
      },
    });
  },

  onCat(e) { this.setData({ catIndex: +e.detail.value }); },
  onSource(e) { this.setData({ sourceIndex: +e.detail.value }); },
  bind(e) { this.setData({ ['form.' + e.currentTarget.dataset.k]: e.detail.value }); },

  // M1.3.5 附件上传（采购合同/合格证/型式试验报告）
  async onPhoto() {
    try { await network.requireOnline(); } catch (err) { return; }
    const m = await wx.chooseMedia({ count: 4, mediaType: ['image'] });
    const ids = [];
    for (const f of m.tempFiles) ids.push(await api.uploadFile(f.tempFilePath, 'image'));
    this.setData({ ['form.attachments']: (this.data.form.attachments || []).concat(ids) });
  },

  async onSubmit() {
    const f = this.data.form;
    if (!f.name) { wx.showToast({ title: '请填写器具名称', icon: 'none' }); return; }
    this.setData({ submitting: true });
    try {
      const payload = {
        category: this.data.categories[this.data.catIndex].code,
        source: this.data.sources[this.data.sourceIndex].value,
        ...f,
      };
      if (this.data.editMode) {
        await api.updateTool(this.data.id, payload); // M1.3.4 编辑（记录变更）
        wx.showToast({ title: '已保存修改', icon: 'success' });
      } else {
        await api.createTool(payload);
        wx.showToast({ title: '已录入', icon: 'success' });
      }
      setTimeout(() => wx.navigateBack(), 800);
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
