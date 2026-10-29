const CACHE_NAME = 'vybz-app-shell-v1';
const APP_SHELL_FILES = [
  './',
  './manifest.webmanifest',
  './icons/vybz-180.png',
  './icons/vybz-192.png',
  './icons/vybz-512.png',
  './icons/vybz.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL_FILES.map((file) => new URL(file, self.registration.scope).href))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('vybz-app-shell-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  const appScope = new URL(self.registration.scope);

  if (
    request.method !== 'GET' ||
    requestUrl.origin !== appScope.origin ||
    !requestUrl.pathname.startsWith(appScope.pathname)
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const appIndex = new URL('./', self.registration.scope).href;
          const cachedApp = await caches.match(appIndex);
          if (cachedApp) return cachedApp;

          return Response.error();
        })
    );
    return;
  }

  if (requestUrl.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});
