// EchoVault — minimal Service Worker.
// Only exists so the browser lets us call registration.showNotification()
// (required on Android and some other mobile browsers, which block the
// plain `new Notification()` constructor outright). No caching, no push,
// no offline behavior — deliberately minimal.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Clicking a reminder notification focuses an existing EchoVault tab if one
// is open, or opens a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});
