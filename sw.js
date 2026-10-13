const VERSION = "ee149e61d4b0";
const FILES = ["assets/index-DPpBxSo5.css","assets/index-DSdqsypP.js","guide-data.bin","icon.svg","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","./","manifest.webmanifest"];
const CACHE = `ffta-editor-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES.map((file) => new Request(file, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('ffta-editor-') && name !== CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function kept(request) {
  return caches.open(CACHE).then((cache) => cache.match(request, { ignoreSearch: true }));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request.url, { cache: 'no-cache', signal: AbortSignal.timeout(3000) })
        .then((response) => (response.ok ? response : Promise.reject(new Error(response.status))))
        .catch(() => kept('./')),
    );
    return;
  }
  event.respondWith(kept(request).then((response) => response ?? fetch(request)));
});
