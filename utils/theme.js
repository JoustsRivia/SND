// utils/theme.js —— 夜间主题模式读写（auto / dark）
const KEY = 'theme_mode';

function getMode() {
  try { return wx.getStorageSync(KEY) || 'auto'; } catch (e) { return 'auto'; }
}
function setMode(mode) {
  try { wx.setStorageSync(KEY, mode); } catch (e) { /* 忽略 */ }
}
// 返回应挂到页面根视图的 class：仅手动 dark 时才返回 theme-dark，
// auto 交给系统媒体查询，light 不挂类。
function classOf(mode) {
  return (mode || getMode()) === 'dark' ? 'theme-dark' : '';
}

module.exports = { getMode, setMode, classOf };
