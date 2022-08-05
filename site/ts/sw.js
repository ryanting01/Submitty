// sw.js
import { registerRoute, Route } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

// // A new route that matches same-origin image requests and handles
// // them with the cache-first, falling back to network strategy:
const imageRoute = new Route(({ request, sameOrigin }) => {
  return sameOrigin && request.destination === 'image'
}, new CacheFirst());

// Register the new route
registerRoute(imageRoute);

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
