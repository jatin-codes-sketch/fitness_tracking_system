/**
 * VitalityHub — PWA Registration
 * Import this once in main.jsx (after React root mount).
 */

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers not supported in this browser.");
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js",
        { scope: "/" }
      );

      // ── Update checks ─────────────────────────────────────────────────
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // Notify UI that a new version is available
            window.dispatchEvent(new CustomEvent("sw-update-available"));
          }
        });
      });

      // ── Periodic background sync (if supported) ───────────────────────
      if ("periodicSync" in registration) {
        try {
          await registration.periodicSync.register("sync-vitals", {
            minInterval: 60 * 60 * 1_000, // 1 hour
          });
        } catch {
          // Permission not granted or not supported; silently skip
        }
      }

      console.log(`[PWA] Service Worker registered (scope: ${registration.scope})`);
    } catch (err) {
      console.error("[PWA] Service Worker registration failed:", err);
    }
  });
}

/** Call this when the user taps "Update Now" in a toast banner. */
export async function applyServiceWorkerUpdate() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }
}