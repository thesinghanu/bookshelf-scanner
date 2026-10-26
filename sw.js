// Offline service worker for My Shelf.
// - App files: cached so the shelf opens offline.
// - Book covers (covers.openlibrary.org): cached the first time they're shown,
// so they stay visible offline. Everything else goes straight to the network.

const CACHE = "myshelf-v3";
const COVERS = "myshelf-covers-v1";
const ASSETS = [
 "./",
 "./index.html",
 "./manifest.webmanifest",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./icons/maskable-512.png",
 "./icons/apple-touch-icon.png",
 "./icons/favicon-32.png"
];

self.addEventListener("install", (event) => {
 event.waitUntil(
 caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
 );
});

self.addEventListener("activate", (event) => {
 event.waitUntil(
 caches.keys()
 .then((keys) => Promise.all(
 keys.filter((k) => k !== CACHE && k !== COVERS).map((k) => caches.delete(k))
 ))
 .then(() => self.clients.claim())
 );
});

self.addEventListener("fetch", (event) => {
 const req = event.request;
 if (req.method !== "GET") return;
 const url = new URL(req.url);

 // Book covers: cache-first, so a cover you've seen once shows offline too.
 if (url.hostname === "covers.openlibrary.org" ||
 url.hostname === "books.google.com" ||
 url.hostname === "books.googleusercontent.com") {
 event.respondWith(
 caches.open(COVERS).then((cache) =>
 cache.match(req).then((hit) => {
 if (hit) return hit;
 return fetch(req).then((resp) => {
 cache.put(req, resp.clone()).catch(() => {});
 return resp;
 });
 // Offline and not cached -> fetch rejects -> the <img> shows our placeholder.
 })
 )
 );
 return;
 }

 // Our own files: cache-first (app shell / offline).
 if (url.origin === self.location.origin) {
 event.respondWith(
 caches.match(req).then((cached) =>
 cached ||
 fetch(req).then((resp) => {
 const copy = resp.clone();
 caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
 return resp;
 }).catch(() => caches.match("./index.html"))
 )
 );
 return;
 }

 // Everything else (CDN script, Open Library API): network as usual.
});