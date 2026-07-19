// utils/flow.js —— 四大核心业务流程的阶段定义与「状态 → 当前阶段」推导
// 仅做纯数据映射，不依赖 wx.* / api，便于单测。
// current 为「当前所处阶段索引」(0-based)；等于 labels.length 表示全部完成；
// 负数（如驳回）会被调用方钳制到 0 并附驳回说明。
const FLOWS = {
  // 领用 → 归还（以器具 status 判断）
  borrow: {
    labels: ['领用', '归还'],
    // in_use=借出在途（领用 active）；lost=丢失属异常，标记 rejected 由组件钳到 0 并显示异常态；
    // 其余（qualified/maintaining 等已归还）= 流程结束。
    current: (status) => (status === 'in_use' ? 0 : status === 'lost' ? -1 : 2),
  },
  // 报修 → 审批 → 维修 → 复检
  repair: {
    labels: ['报修', '审批', '维修', '复检'],
    current: (status) => {
      switch (status) {
        case 'pending': return 0;     // 待审批
        case 'approved': return 2;    // 已审批，待维修
        case 'repaired': return 3;    // 已维修，待复检
        case 'done': return 4;        // 全部完成
        case 'rejected': return -1;   // 审批驳回
        default: return 0;
      }
    },
  },
  // 申请 → 审批 → 验收 → 入库
  purchase: {
    labels: ['申请', '审批', '验收', '入库'],
    current: (status) => {
      switch (status) {
        case 'pending': return 0;
        case 'approved': return 2;    // 审批通过，待验收入库
        case 'accepted': return 4;    // 入库建档，全部完成
        case 'rejected': return -1;   // 驳回
        default: return 0;
      }
    },
  },
  // 申请 → 审批 → 处置
  scrap: {
    labels: ['申请', '审批', '处置'],
    current: (status) => {
      switch (status) {
        case 'pending': return 0;
        case 'approved': return 1;
        case 'disposed': return 3;    // 全部完成
        case 'rejected': return -1;   // 驳回
        default: return 0;
      }
    },
  },
};

// 返回 { type, labels, current, rejected, meta }
// meta 为可选附文数组（与 labels 对齐），用于标注驳回/完成时间等。
function buildFlow(type, status, meta) {
  const f = FLOWS[type];
  if (!f) return { type, labels: [], current: 0, rejected: false, meta: [] };
  let cur = f.current(status == null ? '' : status);
  const rejected = cur < 0;
  if (cur < 0) cur = 0;
  return { type, labels: f.labels, current: cur, rejected, meta: meta || [] };
}

module.exports = { FLOWS, buildFlow };
