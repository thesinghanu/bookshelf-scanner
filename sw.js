// Offline service worker for My Shelf.
// App files are cached for offline use.
// Book covers are cached after first load.

const CACHE = "myshelf-v4";
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
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) =>
              key.startsWith("myshelf-") &&
              key !== CACHE &&
              key !== COVERS
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Cache book covers for offline use.
  const isCover =
    url.hostname === "covers.openlibrary.org" ||
    url.hostname === "books.google.com" ||
    url.hostname === "books.googleusercontent.com" ||
    url.hostname === "archive.org" ||
    url.hostname.endsWith(".archive.org");

  if (isCover) {
    event.respondWith(
      caches.open(COVERS).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;

        try {
          const response = await fetch(req);

          if (response.ok || response.type === "opaque") {
            cache.put(req, response.clone()).catch(() => {});
          }

          return response;
        } catch (error) {
          return new Response("", {
            status: 504,
            statusText: "Cover unavailable offline"
          });
        }
      })
    );
    return;
  }

  // Keep API requests online so ISBN lookups can receive fresh data.
  if (url.origin !== self.location.origin) return;

  // For HTML, prefer the network so deployed updates are picked up.
  if (req.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE)
              .then((cache) => cache.put("./index.html", response.clone()))
              .catch(() => {});
          }
          return response;
        })
        .catch(() =>
          caches.match(req).then(
            (cached) => cached || caches.match("./index.html")
          )
        )
    );
    return;
  }

  // Cache-first for the remaining app assets.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((response) => {
        if (response.ok) {
          caches.open(CACHE)
            .then((cache) => cache.put(req, response.clone()))
            .catch(() => {});
        }
        return response;
      });
    })
  );
});