const staticDevPort = 'Submittty';
const assets = [
];

self.addEventListener('install', (installEvent) => {
    installEvent.waitUntil(
        caches.open(staticDevPort).then((cache) => {
            cache.addAll(assets);
        }),
    );
});

self.addEventListener('fetch', (fetchEvent) => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then((res) => {
            return res || fetch(fetchEvent.request);
        }),
    );
});

self.addEventListener('push', event => {
    const data = JSON.parse(event.data.text());
     const options = {
         body: data.content,
         icon: 'img/pwa_512.png',
         data: {
             url: data.openUrl
         }
     };
     event.waitUntil(
         self.registration.showNotification(data.title, options)
     );
  });