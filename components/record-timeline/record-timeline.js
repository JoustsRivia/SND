// components/record-timeline/record-timeline.js
// 纯展示组件：记录时间线（维保/试验/领用/报废/点检通用）。
Component({
  properties: {
    records:   { type: Array, value: [] },  // [{ time, type, title, desc, operator, status }]
    emptyText: { type: String, value: '暂无记录' },
  },
});
