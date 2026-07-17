// components/quick-actions/quick-actions.js
// 纯展示组件：快捷操作宫格；点击冒泡 'action' 事件（携带 key）。
Component({
  properties: {
    actions: { type: Array, value: [] },  // [{ key, label, icon, type }]
  },
  methods: {
    onTap(e) { this.triggerEvent('action', { key: e.currentTarget.dataset.key }); },
  },
});
