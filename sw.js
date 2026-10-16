/* ============================================================
   Session — service worker
   ------------------------------------------------------------
   Its only job: make the app open instantly, with no signal.

   Your training data is NOT here and never needs to be — it
   lives in localStorage on the phone and always works offline.
   This caches the app shell (the page, the icon, the fonts) so
   the screen can draw at all when there is no connection.

   Update behaviour: a new version downloads quietly in the
   background and takes over on your NEXT launch, never in the
   middle of a session.
   ============================================================ */

const VERSION = 'session-v1';
const CACHE = 'session-shell-' + VERSION;

/* Everything the app needs to draw itself offline. */
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.png',
  './pwa-192.png',
  './pwa-512.png',
  './fonts/archivo-latin-400-normal.woff2',
  './fonts/archivo-latin-600-normal.woff2',
  './fonts/archivo-latin-700-normal.woff2',
  './fonts/archivo-latin-900-normal.woff2',
  './fonts/ibm-plex-mono-latin-400-normal.woff2',
  './fonts/ibm-plex-mono-latin-500-normal.woff2',
  './fonts/ibm-plex-mono-latin-600-normal.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Individually, so one missing file can never block the whole install.
    await Promise.all(SHELL.map(url => cache.add(new Request(url, { cache: 'reload' })).catch(() => {})));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('session-shell-') && k !== CACHE).map(k => caches.delete(k)));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.disable(); } catch(e){}
    }
    await self.clients.claim();
  })());
});

/* The page asks for the new version to take over when it is safe (a fresh launch). */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  /* The sync store (Supabase) must always go to the network — never serve it
     from a cache, and never cache a response. Offline simply means "retry later". */
  if (!sameOrigin) return;

  /* Navigations: network first, so a new version is picked up the moment there is a
     connection; fall back to the cached shell when there is not. */
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put('./index.html', fresh.clone()).catch(() => {});
        return fresh;
      } catch (e) {
        const cache = await caches.open(CACHE);
        return (await cache.match('./index.html'))
            || (await cache.match('./'))
            || new Response('<h1>Session</h1><p>Offline and no cached copy yet — open the app once with a signal.</p>',
                 { headers: { 'Content-Type': 'text/html' }, status: 200 });
      }
    })());
    return;
  }

  /* Everything else on our own origin (fonts, icons, the manifest): cache first,
     refreshed quietly in the background so the next launch has the newest copy. */
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit) {
      fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); }).catch(() => {});
      return hit;
    }
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    } catch (e) {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
