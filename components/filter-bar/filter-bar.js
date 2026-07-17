// components/filter-bar/filter-bar.js
// 多维筛选栏：状态 tab（单选）+ 类别 chip（多选）。
// 交互：`bindtab`(key) / `bindchip`({ key, selected, active })；组件本身只改内部 data。
Component({
  properties: {
    tabs:        { type: Array, value: [] },  // [{ key, label, count }]
    activeTab:   { type: String, value: '' },
    chips:       { type: Array, value: [] },  // [{ key, label }]
    activeChips: { type: Array, value: [] },  // [key, ...]
  },
  data: { chipList: [] },
  observers: {
    'chips,activeChips': function (chips, active) {
      const set = active || [];
      const list = (chips || []).map((c) => ({ ...c, on: set.indexOf(c.key) >= 0 }));
      this.setData({ chipList: list });
    },
  },
  methods: {
    onTab(e) { this.triggerEvent('tab', { key: e.currentTarget.dataset.key }); },
    onChip(e) {
      const key = e.currentTarget.dataset.key;
      const set = this.data.activeChips.slice();
      const i = set.indexOf(key);
      if (i >= 0) set.splice(i, 1); else set.push(key);
      this.setData({ activeChips: set });
      this.triggerEvent('chip', { key, selected: i < 0, active: set });
    },
  },
});
