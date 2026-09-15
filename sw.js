/* سرویس‌ورکر بلوک: فقط برای دریافت و نمایش اعلان‌های Push استفاده می‌شود (بدون کش/آفلاین). */
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'بلوک', body: event.data ? event.data.text() : '' };
  }
  var title = data.title || 'بلوک';
  var options = {
    body: data.body || '',
    icon: '/favicon.png',
    badge: '/favicon.png',
    dir: 'rtl',
    lang: 'fa',
    data: { targetType: data.targetType || null, targetId: data.targetId || null },
    tag: data.targetType && data.targetId ? data.targetType + ':' + data.targetId : undefined,
    renotify: !!(data.targetType && data.targetId),
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = event.notification.data || {};
  var url = '/';
  if (target.targetType) {
    url = '/?notif=' + encodeURIComponent(target.targetType) + (target.targetId ? ':' + encodeURIComponent(target.targetId) : '');
  }
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          client.postMessage({ type: 'blook-notification-click', targetType: target.targetType, targetId: target.targetId });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
