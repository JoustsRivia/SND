// utils/modules.js
// 模块菜单（九宫格工作台数据源）。按角色权限动态展示：roles 含 'all' 表示全员可见，
// 否则仅当登录角色命中 roles 才展示。页面只读取过滤后的列表，权限判断集中在此。
const { ROLES } = require('./constants');

// 角色可见性快捷：管理类角色
const ADMIN = [ROLES.LEAD, ROLES.SUPERVISOR, ROLES.ADMIN];
const MGMT = [ROLES.LEAD, ROLES.SUPERVISOR, ROLES.PROJECT_LEAD, ROLES.SAFETY_OFFICER];

const MODULES = [
  { key: 'ledger',   label: '器具台账', icon: '📋', url: '/pages/ledger/ledger', tab: true,  roles: ['all'] },
  { key: 'reconcile', label: '账物核对', icon: '🧾', url: '/pkg-ledger/pages/reconcile/reconcile', roles: MGMT },
  { key: 'scan',     label: '扫一扫',   icon: '📷', url: '/pages/scan/scan',     tab: true,  roles: ['all'] },
  { key: 'borrow',   label: '领用归还', icon: '🔄', url: '/pkg-borrow/pages/records/records', roles: ['all'] },
  { key: 'test',     label: '周期试验', icon: '🧪', url: '/pkg-test/pages/due-list/due-list',  roles: ['all'] },
  { key: 'site',     label: '现场点检', icon: '✅', url: '/pkg-site/pages/daily-check/daily-check', roles: ['worker', 'group_lead', 'safety_officer', 'lease_admin', 'supervisor', 'lead', 'project_lead'] },
  { key: 'maint',    label: '维保报修', icon: '🔧', url: '/pkg-maint/pages/repair/repair', roles: ['all'] },
  { key: 'mplan',    label: '保养计划', icon: '🗓️', url: '/pkg-maint/pages/plan/plan', roles: ['all'] },
  { key: 'scrap',    label: '报废管理', icon: '🗑️', url: '/pkg-scrap/pages/apply/apply', roles: ['all'] },
  { key: 'purchase', label: '采购验收', icon: '🛒', url: '/pkg-purchase/pages/apply/apply', roles: ['safety_officer', 'group_lead', 'project_lead', 'lead', 'supervisor'] },
  { key: 'store',    label: '库房管理', icon: '🏬', url: '/pkg-store/pages/register/register', roles: ['safety_officer', 'lease_admin', 'group_lead', 'project_lead', 'lead'] },
  { key: 'train',    label: '培训管理', icon: '🎓', url: '/pkg-train/pages/courses/courses', roles: ['all'] },
  { key: 'cert',     label: '我的证书', icon: '📜', url: '/pkg-cert/pages/list/list', roles: ['all'] },
  { key: 'check',    label: '监督检查', icon: '🔍', url: '/pkg-check/pages/hazard/hazard', roles: ['all'] },
  { key: 'perf',     label: '人员考核', icon: '🏅', url: '/pkg-check/pages/performance/performance', roles: MGMT },
  { key: 'barcode',  label: '条码管理', icon: '🔖', url: '/pkg-barcode/pages/gen/gen', roles: ['safety_officer', 'group_lead', 'lease_admin', 'project_lead', 'lead'] },
  { key: 'label',    label: '标识牌',   icon: '🏷️', url: '/pkg-barcode/pages/label/label', roles: ['safety_officer', 'group_lead', 'lease_admin', 'project_lead', 'lead'] },
  { key: 'stats',    label: '统计驾驶舱', icon: '📊', url: '/pkg-stats/pages/dashboard/dashboard', roles: MGMT },
  { key: 'system',   label: '系统管理', icon: '⚙️', url: '/pkg-system/pages/org/org', roles: ADMIN },
  { key: 'message',  label: '消息预警', icon: '🔔', url: '/pages/message/message', tab: true, roles: ['all'] },
];

// 按当前角色过滤可见模块
function visibleModules(role) {
  if (!role) return MODULES.filter((m) => m.roles.includes('all'));
  return MODULES.filter((m) => m.roles.includes('all') || m.roles.includes(role));
}

module.exports = { MODULES, visibleModules, ADMIN, MGMT };
