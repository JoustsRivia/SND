// pages/scan/scan.js —— 扫码中枢（M14）：扫码后跳转器具档案 / 按角色路由
const api = require('../../utils/api');
const auth = require('../../utils/auth');
const network = require('../../utils/network');

const ROLE_TEXT = {
  lead: '专班负责人', project_lead: '项目部负责人', safety_officer: '专职安全员',
  group_lead: '班组长', supervisor: '安监管理', worker: '作业人员', lease_admin: '租赁管理员',
};

Page({
  data: {
    role: '',
    roleText: '',
    recent: [],
    notice: [
      '核对器具编号与系统一致',
      '合格且在有效期内的器具方可领用',
      '报废、禁用、超期器具禁止领用',
    ],
  },

  onShow() {
    // 问题1：未登录拦截
    if (!auth.isLoggedIn()) { wx.reLaunch({ url: '/pages/login/login' }); return; }
    // 确保登录态，避免角色显示「未登录」
    auth.ensureLogin().catch(() => {});
    const p = auth.getProfile();
    this.setData({
      role: p ? p.role : '',
      roleText: p ? (ROLE_TEXT[p.role] || '成员') : '',
    });
  },

  async onScan() {
    // 无网络提示（M5.1.5 / M6.1.5）
    try { await network.requireOnline(); } catch (e) { return; }

    wx.scanCode({
      success: async (res) => {
        const code = res.result;
        const tool = await api.getToolDetail(code).catch(() => null);
        if (!tool) { wx.showToast({ title: '未识别的器具', icon: 'none' }); return; }
        const recent = this.data.recent.filter((r) => r._id !== tool._id).slice(0, 4);
        recent.unshift({ _id: tool._id, name: tool.name, status: tool.status, code: tool.code || code });
        this.setData({ recent });
        wx.showToast({ title: '扫码成功：' + tool.name, icon: 'none' });
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/tool-detail/tool-detail?id=' + (tool._id || code) });
        }, 600);
      },
      fail: () => {},
    });
  },

  onManual() {
    wx.showModal({
      title: '手动输入编号',
      editable: true,
      placeholderText: '请输入器具编号 / 二维码内容',
      success: async (r) => {
        if (!r.confirm || !r.content) return;
        const tool = await api.getToolDetail(r.content.trim()).catch(() => null);
        if (!tool) { wx.showToast({ title: '未找到该器具', icon: 'none' }); return; }
        wx.navigateTo({ url: '/pages/tool-detail/tool-detail?id=' + (tool._id || r.content.trim()) });
      },
    });
  },

  onTapRecent(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: '/pages/tool-detail/tool-detail?id=' + id });
  },
});
