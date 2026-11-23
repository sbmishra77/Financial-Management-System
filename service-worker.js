const CACHE_NAME = "wealth-manager-pwa-v1";

const STATIC_ASSETS = [
  "./",
  "./login.html",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./assets/sbm-profile.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./js/refresh.js",
  "./js/stockMaster.js",
  "./js/rentalManagement.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Firebase Auth / Firestore / external requests ko cache na karein
  if (
    url.origin !== self.location.origin ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("googleapis.com")
  ) {
    return;
  }

  // HTML pages ke liye network-first taaki naya update turant mile
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match("./login.html")))
    );
    return;
  }

  // Baaki static assets ke liye cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});