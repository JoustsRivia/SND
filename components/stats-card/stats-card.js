// components/stats-card/stats-card.js
// 纯展示组件：指标卡网格。不调用任何 api / wx.*。
Component({
  properties: {
    title:   { type: String, value: '' },
    items:   { type: Array, value: [] },  // [{ label, value, color }]
    columns: { type: Number, value: 4 },
  },
});
