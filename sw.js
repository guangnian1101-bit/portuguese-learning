/* 学葡语 · Aprender Português — Service Worker
   预缓存外壳资源；运行时按需缓存音频，支持离线重播。 */
var CACHE = 'pt-learn-v38';
var PRECACHE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var url;
  try { url = new URL(e.request.url); } catch (err) { return; }
  // 跨域请求（字体、外部 API）直接放行
  if (url.origin !== location.origin) return;

  var isGet = e.request.method === 'GET';

  // 音频：缓存优先，未命中则网络并写入缓存（离线可重播听过的词）
  if (url.pathname.indexOf('/audio/') !== -1 && isGet) {
    e.respondWith(
      caches.match(e.request).then(function (cached) {
        if (cached) return cached;
        return fetch(e.request).then(function (res) {
          if (res && res.status === 200) {
            var clone = res.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
          }
          return res;
        });
      })
    );
    return;
  }

  // 页面/资源：网络优先（保证更新），离线时回退缓存
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && res.status === 200 && isGet) {
        var clone = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
