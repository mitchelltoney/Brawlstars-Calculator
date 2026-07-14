// Service worker for brawlcalculator.com.
//
// Strategy:
//   - icons/ and fonts/ are cache-first (they change rarely and there are
//     ~100 of them — this is what makes the app usable offline mid-draft).
//   - everything else same-origin is network-first with cache fallback, so
//     a deploy to GitHub Pages is picked up on the next load, but the app
//     still opens with the last-seen version when offline.
//
// Bump CACHE whenever a breaking asset change ships (renamed files, new
// icon format) so stale entries are dropped on activate.
const CACHE = "bc-2026-07-14";

const PRECACHE = [
  "./",
  "index.css",
  "styles.css",
  "app.js",
  "calculate.js",
  "counters.js",
  "matchup-notes.js",
  "loader.js",
  "loading_chester.png",
  "fonts/lilitaone-latin.woff2",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  const cacheFirst = url.pathname.includes("/icons/") || url.pathname.includes("/fonts/");

  if (cacheFirst) {
    e.respondWith(
      caches.match(e.request).then(hit =>
        hit ||
        fetch(e.request).then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return res;
        })
      )
    );
  } else {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
