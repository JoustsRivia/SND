// utils/modules.js
// 模块菜单（九宫格工作台数据源）。按角色权限动态展示：roles 含 'all' 表示全员可见，
// 否则仅当登录角色命中 roles 才展示。页面只读取过滤后的列表，权限判断集中在此。
const { ROLES } = require('./constants');

// 角色可见性快捷：管理类角色（业务管理，非系统管理员）
const ADMIN = [ROLES.LEAD, ROLES.SUPERVISOR, ROLES.ADMIN];
const MGMT = [ROLES.LEAD, ROLES.SUPERVISOR, ROLES.PROJECT_LEAD, ROLES.SAFETY_OFFICER];

// 模块分类（九宫格按分类分组展示）
const CATEGORIES = [
  { key: 'ledger', name: '台账与档案' },
  { key: 'use', name: '使用与现场' },
  { key: 'supply', name: '采购与库房' },
  { key: 'supervise', name: '监督与培训' },
  { key: 'code', name: '条码与标识' },
  { key: 'analysis', name: '统计与分析' },
  { key: 'system', name: '系统与管理' },
];

const MODULES = [
  { key: 'ledger',   label: '器具台账', icon: '📋', url: '/pages/ledger/ledger', tab: true,  roles: ['all'], category: 'ledger' },
  { key: 'reconcile', label: '账物核对', icon: '🧾', url: '/pkg-ledger/pages/reconcile/reconcile', roles: MGMT, category: 'ledger' },
  { key: 'cert',     label: '我的证书', icon: '📜', url: '/pkg-cert/pages/list/list', roles: ['all'], category: 'ledger' },

  { key: 'borrow',   label: '领用归还', icon: '🔄', url: '/pkg-borrow/pages/records/records', roles: ['all'], category: 'use' },
  { key: 'test',     label: '周期试验', icon: '🧪', url: '/pkg-test/pages/due-list/due-list',  roles: ['all'], category: 'use' },
  { key: 'site',     label: '现场点检', icon: '✅', url: '/pkg-site/pages/daily-check/daily-check', roles: ['worker', 'group_lead', 'safety_officer', 'lease_admin', 'supervisor', 'lead', 'project_lead'], category: 'use' },
  { key: 'maint',    label: '维保报修', icon: '🔧', url: '/pkg-maint/pages/repair/repair', roles: ['all'], category: 'use' },
  { key: 'mplan',    label: '保养计划', icon: '🗓️', url: '/pkg-maint/pages/plan/plan', roles: ['all'], category: 'use' },
  { key: 'scrap',    label: '报废管理', icon: '🗑️', url: '/pkg-scrap/pages/apply/apply', roles: ['all'], category: 'use' },

  { key: 'purchase', label: '采购验收', icon: '🛒', url: '/pkg-purchase/pages/apply/apply', roles: ['safety_officer', 'group_lead', 'project_lead', 'lead', 'supervisor'], category: 'supply' },
  { key: 'store',    label: '库房管理', icon: '🏬', url: '/pkg-store/pages/register/register', roles: ['safety_officer', 'lease_admin', 'group_lead', 'project_lead', 'lead'], category: 'supply' },

  { key: 'check',    label: '监督检查', icon: '🔍', url: '/pkg-check/pages/hazard/hazard', roles: ['all'], category: 'supervise' },
  { key: 'perf',     label: '人员考核', icon: '🏅', url: '/pkg-check/pages/performance/performance', roles: MGMT, category: 'supervise' },
  { key: 'train',    label: '培训管理', icon: '🎓', url: '/pkg-train/pages/courses/courses', roles: ['all'], category: 'supervise' },

  { key: 'barcode',  label: '条码管理', icon: '🔖', url: '/pkg-barcode/pages/gen/gen', roles: ['safety_officer', 'group_lead', 'lease_admin', 'project_lead', 'lead'], category: 'code' },
  { key: 'label',    label: '标识牌',   icon: '🏷️', url: '/pkg-barcode/pages/label/label', roles: ['safety_officer', 'group_lead', 'lease_admin', 'project_lead', 'lead'], category: 'code' },

  { key: 'stats',    label: '统计驾驶舱', icon: '📊', url: '/pkg-stats/pages/dashboard/dashboard', roles: MGMT, category: 'analysis' },

  { key: 'system',   label: '系统管理', icon: '⚙️', url: '/pkg-system/pages/org/org', roles: [ROLES.ADMIN], category: 'system' },
  { key: 'message',  label: '消息预警', icon: '🔔', url: '/pages/message/message', tab: true, roles: ['all'], category: 'system' },
];

// 按当前角色过滤可见模块
function visibleModules(role) {
  if (!role) return MODULES.filter((m) => m.roles.includes('all'));
  return MODULES.filter((m) => m.roles.includes('all') || m.roles.includes(role));
}

// 按分类分组（仅保留有可见模块的分类），供九宫格分区渲染
function moduleGroups(role) {
  const vis = visibleModules(role);
  return CATEGORIES.map((cat) => ({
    key: cat.key,
    name: cat.name,
    items: vis.filter((m) => m.category === cat.key),
  })).filter((g) => g.items.length);
}

module.exports = { MODULES, visibleModules, moduleGroups, CATEGORIES, ADMIN, MGMT };
