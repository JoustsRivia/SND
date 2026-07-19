// utils/fonts.js —— 字体加载脚手架（图标字体 + 展示/等宽数字字体）
//
// 设计意图（见 DESIGN_SYSTEM.md §6 / P2「字体」）：
//   1. 首屏静默加载「展示/等宽数字字体」，使仪表盘统计、Hero 数字等使用等宽数字，
//      数字跳动时列对齐更稳、观感更专业。
//   2. 「图标字体」为可选增强：团队把 iconfont.cn 项目导出的 .ttf 托管到自有 CDN 后，
//      填入 ICONFONT_URL 即可将九宫格 emoji 图标替换为统一图标字体。
//      替换路径与命名约定见 DESIGN_SYSTEM.md §6 / P2。
//   3. 所有加载均 try/catch 守护，失败或被网络白名单拦截时「静默回退系统字体」，
//      绝不阻塞首屏，也不抛未捕获异常（适合现场弱网/离线场景）。
//
// 字体族名约定：
//   - SNDNum ：等宽数字（仪表盘、Hero），wxss 中通过 --font-num 令牌引用，回退系统等宽栈。
//   - SNDIcon：图标字体（可选），wxss 中通过 .iconfont 类引用，回退系统字体。

// 等宽数字字体：默认使用 @fontsource/roboto-mono 的 woff（woff 在微信基础库兼容性优于 woff2）。
// 生产环境请将域名 cdn.jsdelivr.net 加入小程序「downloadFile 合法域名」，或改为你方托管的同源文件。
const NUM_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/roboto-mono@5.0.20/files/roboto-mono-latin-400-normal.woff';

// 图标字体：留空表示「暂不加载」，九宫格继续用 emoji 图标。
// 接入步骤：1) 在 iconfont.cn 建项目并添加所需图标；2) 下载 .ttf 托管到自有 CDN；
//          3) 把下面地址替换为该 .ttf URL（如 https://your-cdn.example.com/snd-iconfont.ttf）；
//          4) 在 wxml 中将 emoji 文本改为 <text class="iconfont">&#xe001;</text> 之类。
const ICONFONT_URL = '';

// 单次加载：成功/失败都 resolve（失败返回 false），不让未捕获 reject 冒泡到 onLaunch。
function loadOne(family, url) {
  return new Promise((resolve) => {
    if (!url) { resolve(false); return; }
    wx.loadFontFace({
      family,
      source: 'url("' + url + '")',
      scopes: ['webview', 'native'],
      success: () => resolve(true),
      fail: (err) => {
        console.warn('[fonts] 加载失败，回退系统字体：', family, err);
        resolve(false);
      },
    });
  });
}

// 并发加载所有字体；整体异常也吞掉，绝不影响首屏。
function loadFonts() {
  const tasks = [
    loadOne('SNDNum', NUM_URL),
    loadOne('SNDIcon', ICONFONT_URL),
  ];
  return Promise.all(tasks).catch(() => []);
}

module.exports = { loadFonts, NUM_URL, ICONFONT_URL };
