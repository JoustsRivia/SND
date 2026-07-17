// components/menu-list/menu-list.js
// 纯展示组件：分组菜单列表；点击冒泡 'select' 事件（携带 key）。
Component({
  properties: {
    groups: { type: Array, value: [] },  // [{ title?, items: [{ key, icon, label, value, badge, arrow }] }]
  },
  methods: {
    onSelect(e) { this.triggerEvent('select', { key: e.currentTarget.dataset.key }); },
  },
});
