/**
 * VitalityHub — Service Worker
 * Strategy:
 *   • App Shell (HTML, JS, CSS, fonts) → Cache-First
 *   • API calls (/v1/*)               → Network-First with fallback
 *   • Images / icons                  → Stale-While-Revalidate
 */

const CACHE_VERSION   = "v1.0.0";
const SHELL_CACHE     = `vh-shell-${CACHE_VERSION}`;
const DYNAMIC_CACHE   = `vh-dynamic-${CACHE_VERSION}`;
const API_CACHE       = `vh-api-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

const KNOWN_CACHES = [SHELL_CACHE, DYNAMIC_CACHE, API_CACHE];



// ─── Listen for messages from client ──────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});


// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !KNOWN_CACHES.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});


// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (except fonts/CDN)
  if (request.method !== "GET") return;
  if (url.origin !== location.origin && !url.hostname.includes("fonts.g")) return;

  // ── API: Network-First ──────────────────────────────────────────────────
  if (url.pathname.startsWith("/v1/")) {
    event.respondWith(networkFirstStrategy(request, API_CACHE, 5_000));
    return;
  }

  // ── Navigation (HTML): Cache-First with offline fallback ─────────────
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).catch(() => caches.match("/offline.html"))
      )
    );
    return;
  }

  // ── Static Assets: Stale-While-Revalidate ────────────────────────────
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});


// ─── Strategies ───────────────────────────────────────────────────────────────

async function networkFirstStrategy(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);
    const response   = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(
      JSON.stringify({ error: "Offline — cached data unavailable." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });

  return cached || fetchPromise;
}


// ─── Background Sync (offline vitals logging) ─────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-vitals") {
    event.waitUntil(syncOfflineVitals());
  }
});

async function syncOfflineVitals() {
  // IndexedDB queue → flush to /v1/health/vitals when back online
  // Implementation hooks into the app's offline queue store.
  console.log("[SW] Syncing offline vitals…");
}


// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "VitalityHub", {
      body: data.body ?? "Time to log your vitals!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: { url: data.url ?? "/" },
      actions: [
        { action: "open", title: "Open App" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      const target = event.notification.data?.url ?? "/";
      const existing = windowClients.find((c) => c.url === target);
      return existing ? existing.focus() : clients.openWindow(target);
    })
  );
});