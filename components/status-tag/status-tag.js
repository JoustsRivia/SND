// components/status-tag/status-tag.js
// 纯展示组件：依据 status 渲染颜色标签。不调用任何 api / wx.*。
const MAP = {
  qualified:    { text: '合格',   cls: 'success' },
  pending_test: { text: '待检',   cls: 'warning' },
  expired:      { text: '超期',   cls: 'danger' },
  scrapped:     { text: '报废',   cls: 'dark' },
  maintaining:  { text: '维修中', cls: 'primary' },
  missing:      { text: '缺失',   cls: 'danger' },
  forbidden:    { text: '禁用',   cls: 'dark' },
  disabled:     { text: '已禁用', cls: 'dark' },
  lease:        { text: '租赁',   cls: 'info' },
  normal:       { text: '正常',   cls: 'success' },
};

Component({
  properties: {
    status: { type: String, value: 'qualified' },
    text:   { type: String, value: '' },     // 显式覆盖文案
    size:   { type: String, value: 'md' },   // sm | md
    plain:  { type: Boolean, value: false },
  },
  data: { cls: 'success', label: '合格' },
  observers: {
    'status,text': function (status, text) {
      const m = MAP[status] || MAP.normal;
      this.setData({ cls: m.cls, label: text || m.text });
    },
  },
});
