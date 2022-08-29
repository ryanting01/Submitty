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

//options could be customized with https://docs.w3cub.com/dom/serviceworkerregistration/shownotification
    const options = {
         body: data.content,
         icon: 'img/pwa_512.png',
         data: {
             url: data.url
         }
     };
     event.waitUntil(
         self.registration.showNotification(data.title, options)
     );
  });



if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("http://localhost:1511/sw.js")
                .then(res => console.log("service worker registered"))
                .catch(err => console.log("service worker not registered", err))
        })
    }