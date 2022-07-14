const staticDevPort = 'Submittty';
const assets = async (resources) => {
    const cache = await caches.open("v1");
    await cache.addAll(resources);
  };

self.addEventListener('install', (installEvent) => {
    installEvent.waitUntil(
        assets([
            "./css/forum.css"
          ])
    );
});

self.addEventListener('fetch', (fetchEvent) => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then((res) => {
            return res || fetch(fetchEvent.request);
        }),
    );
});
