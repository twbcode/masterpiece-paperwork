// Offline support: keeps a copy of the program so it opens without internet.
// A new version (new cache name) replaces the old copy the next time the program is opened online.
const CACHE = "mpc-paperwork-1.0.7";
const FILES = [
 "./",
 "index.html",
 "manifest.webmanifest",
 "engine/pyodide-lock.json",
 "engine/pyodide.asm.js",
 "engine/pyodide.asm.wasm",
 "engine/pyodide.js",
 "engine/python_stdlib.b64.txt",
 "py/charset_normalizer-3.5.2-py3-none-any.b64.txt",
 "py/fonttools-4.67.0-py3-none-any.b64.txt",
 "py/pdfminer_six-20260107-py3-none-any.b64.txt",
 "py/pdfplumber-0.11.10-py3-none-any.b64.txt",
 "py/pypdf-6.17.0-py3-none-any.b64.txt",
 "py/reportlab-5.0.1-py3-none-any.b64.txt",
 "fonts/Carlito-Regular.ttf",
 "fonts/DejaVuSansCondensed.ttf",
 "scripts/analyze_photo.py.txt",
 "scripts/build_contract.py.txt",
 "scripts/build_estimate.py.txt",
 "scripts/build_invoice.py.txt",
 "scripts/mpc_engine.py.txt",
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
