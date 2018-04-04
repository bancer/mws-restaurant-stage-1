const staticCacheName = 'mws-restaurant-stage-v1';
const allCaches = [
  staticCacheName
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(function(cache) {
        const urlsToCache = [
          '/',
          '/css/styles.css',
          '/js/dbhelper.js',
          '/js/main.js',
          '/js/restaurant_info.js'
        ];
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('mws-restaurant-') &&
                 !allCaches.includes(cacheName);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(staticCacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request).then(function(networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
