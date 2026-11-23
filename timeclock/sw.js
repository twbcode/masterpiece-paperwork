// Offline support: keeps a copy of the program so it opens without internet.
// A new version (new cache name) replaces the old copy the next time the program is opened online.
const CACHE = "mpc-timeclock-1.0.1";
const FILES = [
 "./",
 "index.html",
 "manifest.webmanifest",
 "icons/icon-192-maskable.png",
 "icons/icon-192.png",
 "icons/icon-512-maskable.png",
 "icons/icon-512.png",
 "brand/masterpiece-logo.svg"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.includes("/timeclock/")) return;   // the time clock has its own offline copy
  const isPage = req.mode === "navigate";
  if (isPage) {   // the page itself: newest when online, saved copy when offline
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((k) => k.put("index.html", c)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // everything else (program files, pdf.js, fonts): saved copy first, then the network
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then((k) => k.put(req, c)); }
    return r;
  })));
});
