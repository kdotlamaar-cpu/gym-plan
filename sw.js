/* Five O'Clock Gym Plan — service worker: offline support once hosted.
   Pages, scripts and styles: served from cache, refreshed in the background (so updates arrive).
   Exercise photos and icons: cache-first. Google Fonts: cached after the first visit.
   Bump VERSION when you change files, so phones drop the old cache. */
const VERSION = "fogp-v4";
const CORE = [
  "./", "index.html", "workouts.html", "tracker.html", "progress.html", "diet.html", "schedule.html",
  "cult.html", "guide.html", "gyms.html", "settings.html", "manifest.webmanifest",
  "assets/css/style.css", "assets/js/data.js", "assets/js/store.js", "assets/js/layout.js",
  "assets/js/home.js", "assets/js/workouts.js", "assets/js/tracker.js", "assets/js/progress.js", "assets/js/settings.js",
  "assets/favicon.svg", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/apple-touch-icon.png",
  "assets/img/ex/barbell-bench-press-medium-grip-0.jpg",
  "assets/img/ex/barbell-bench-press-medium-grip-1.jpg",
  "assets/img/ex/barbell-incline-bench-press-medium-grip-0.jpg",
  "assets/img/ex/barbell-incline-bench-press-medium-grip-1.jpg",
  "assets/img/ex/barbell-squat-0.jpg",
  "assets/img/ex/barbell-squat-1.jpg",
  "assets/img/ex/bicycling-stationary-0.jpg",
  "assets/img/ex/bicycling-stationary-1.jpg",
  "assets/img/ex/cable-crossover-0.jpg",
  "assets/img/ex/cable-crossover-1.jpg",
  "assets/img/ex/cable-crunch-0.jpg",
  "assets/img/ex/cable-crunch-1.jpg",
  "assets/img/ex/cable-rope-overhead-triceps-extension-0.jpg",
  "assets/img/ex/cable-rope-overhead-triceps-extension-1.jpg",
  "assets/img/ex/cable-seated-lateral-raise-0.jpg",
  "assets/img/ex/cable-seated-lateral-raise-1.jpg",
  "assets/img/ex/dead-bug-0.jpg",
  "assets/img/ex/dead-bug-1.jpg",
  "assets/img/ex/dip-machine-0.jpg",
  "assets/img/ex/dip-machine-1.jpg",
  "assets/img/ex/dumbbell-lunges-0.jpg",
  "assets/img/ex/dumbbell-lunges-1.jpg",
  "assets/img/ex/ez-bar-curl-0.jpg",
  "assets/img/ex/ez-bar-curl-1.jpg",
  "assets/img/ex/face-pull-0.jpg",
  "assets/img/ex/face-pull-1.jpg",
  "assets/img/ex/hack-squat-0.jpg",
  "assets/img/ex/hack-squat-1.jpg",
  "assets/img/ex/hammer-curls-0.jpg",
  "assets/img/ex/hammer-curls-1.jpg",
  "assets/img/ex/hyperextensions-back-extensions-0.jpg",
  "assets/img/ex/hyperextensions-back-extensions-1.jpg",
  "assets/img/ex/incline-dumbbell-curl-0.jpg",
  "assets/img/ex/incline-dumbbell-curl-1.jpg",
  "assets/img/ex/incline-dumbbell-press-0.jpg",
  "assets/img/ex/incline-dumbbell-press-1.jpg",
  "assets/img/ex/leg-extensions-0.jpg",
  "assets/img/ex/leg-extensions-1.jpg",
  "assets/img/ex/leg-press-0.jpg",
  "assets/img/ex/leg-press-1.jpg",
  "assets/img/ex/leverage-chest-press-0.jpg",
  "assets/img/ex/leverage-chest-press-1.jpg",
  "assets/img/ex/lying-leg-curls-0.jpg",
  "assets/img/ex/lying-leg-curls-1.jpg",
  "assets/img/ex/lying-t-bar-row-0.jpg",
  "assets/img/ex/lying-t-bar-row-1.jpg",
  "assets/img/ex/one-arm-dumbbell-row-0.jpg",
  "assets/img/ex/one-arm-dumbbell-row-1.jpg",
  "assets/img/ex/one-arm-kettlebell-swings-0.jpg",
  "assets/img/ex/one-arm-kettlebell-swings-1.jpg",
  "assets/img/ex/pullups-0.jpg",
  "assets/img/ex/pullups-1.jpg",
  "assets/img/ex/reverse-machine-flyes-0.jpg",
  "assets/img/ex/reverse-machine-flyes-1.jpg",
  "assets/img/ex/romanian-deadlift-0.jpg",
  "assets/img/ex/romanian-deadlift-1.jpg",
  "assets/img/ex/rowing-stationary-0.jpg",
  "assets/img/ex/rowing-stationary-1.jpg",
  "assets/img/ex/seated-cable-rows-0.jpg",
  "assets/img/ex/seated-cable-rows-1.jpg",
  "assets/img/ex/seated-dumbbell-press-0.jpg",
  "assets/img/ex/seated-dumbbell-press-1.jpg",
  "assets/img/ex/side-lateral-raise-0.jpg",
  "assets/img/ex/side-lateral-raise-1.jpg",
  "assets/img/ex/standing-calf-raises-0.jpg",
  "assets/img/ex/standing-calf-raises-1.jpg",
  "assets/img/ex/triceps-pushdown-rope-attachment-0.jpg",
  "assets/img/ex/triceps-pushdown-rope-attachment-1.jpg",
  "assets/img/ex/wide-grip-lat-pulldown-0.jpg",
  "assets/img/ex/wide-grip-lat-pulldown-1.jpg",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !isFont) return;
  const cacheFirst = /\/assets\/(img|icons)\//.test(url.pathname) || url.hostname === "fonts.gstatic.com";
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; });
    if (hit && cacheFirst) return hit;
    if (hit) { net.catch(() => {}); return hit; }
    return net.catch(() => (req.mode === "navigate" ? cache.match("index.html") : Response.error()));
  }));
});
