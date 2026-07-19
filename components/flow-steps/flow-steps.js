// components/flow-steps/flow-steps.js
// 纯展示组件：四大核心流程的阶段步进器（领用归还/报修复检/采购入库/报废处置）。
// 仅依赖设计令牌；不调用任何 api / wx.*。
Component({
  properties: {
    labels:  { type: Array, value: [] },   // 阶段文案，如 ['报修','审批','维修','复检']
    current: { type: Number, value: 0 },     // 当前所处阶段索引；== labels.length 表示全部完成
    meta:    { type: Array, value: [] },     // 可选：每阶段附文（时间/说明），与 labels 对齐
    title:   { type: String, value: '' },    // 区块标题，留空不渲染
    rejected:{ type: Boolean, value: false },// 流程被驳回时的整体标记（首阶段标红注记）
  },
  data: { nodes: [] },
  observers: {
    'labels,current,meta,rejected': function (labels, current, meta, rejected) {
      const n = (labels || []).length;
      const nodes = (labels || []).map((label, i) => {
        let state = 'wait';
        if (current >= n) state = 'done';        // 全部完成
        else if (i < current) state = 'done';
        else if (i === current) state = (rejected && i === 0) ? 'reject' : 'active';
        else state = 'wait';
        return { label, state, meta: (meta && meta[i]) || '' };
      });
      this.setData({ nodes });
    },
  },
});
