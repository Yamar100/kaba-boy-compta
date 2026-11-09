/* KABA BOY Compta – offline shell. Data is never cached here: it lives on GitHub. */
var CACHE = 'kbc-shell-v1';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = new URL(req.url);
  if (u.hostname === 'api.github.com' || u.hostname === 'api.anthropic.com' || u.protocol === 'blob:') return;
  if (u.origin === self.location.origin) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(function (r) {
      if (r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); }
      return r;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
    }));
    return;
  }
  if (/(^|\.)cdnjs\.cloudflare\.com$|(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); return res; });
    }));
  }
});
