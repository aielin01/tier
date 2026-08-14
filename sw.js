// 幸逢 · 最小化 Service Worker
// 唯一用途：让 showNotification() 可用——
// 安卓 Chrome 等绝大多数移动端浏览器禁止页面脚本直接 new Notification()，
// 必须经由已注册的 Service Worker 派发系统通知。
// 本文件不做任何缓存 / 离线拦截，不影响现有网络行为。

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 点击系统通知时，尝试聚焦/打开应用窗口
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
