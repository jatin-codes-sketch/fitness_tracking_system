/**
 * VitalityHub — Centralised API Client
 * Axios instance with:
 *  • JWT bearer injection
 *  • 401 auto-logout
 *  • Offline queue via IndexedDB (idb)
 */

import axios from "axios";
import { openDB } from "idb";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

// ─── Axios instance ────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach Bearer token ───────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vh_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 ──────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("vh_token");
      window.dispatchEvent(new CustomEvent("vh-unauthorized"));
    }
    return Promise.reject(err);
  }
);


// ─── Offline queue (IndexedDB) ─────────────────────────────────────────────

const DB_NAME    = "vh-offline-queue";
const STORE_NAME = "requests";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

export async function queueOfflineRequest(method, url, data) {
  const db = await getDB();
  await db.add(STORE_NAME, { method, url, data, queuedAt: new Date().toISOString() });
}

export async function flushOfflineQueue() {
  const db      = await getDB();
  const pending = await db.getAll(STORE_NAME);
  for (const req of pending) {
    try {
      await api({ method: req.method, url: req.url, data: req.data });
      await db.delete(STORE_NAME, req.id);
    } catch {
      break; // stop on first failure; retry on next online event
    }
  }
}

// Flush when connectivity is restored
window.addEventListener("online", flushOfflineQueue);


// ─── Typed request helpers ─────────────────────────────────────────────────

export const authAPI = {
  register: (body)  => api.post("/v1/auth/register", body),
  login:    (body)  => api.post("/v1/auth/login",    body),
};

export const healthAPI = {
  logVitals: (body)          => api.post("/v1/health/vitals", body),
  getStats:  (days = 30)     => api.get(`/v1/health/stats?days=${days}`),
};

export const fitnessAPI = {
  logWorkout:   (body)       => api.post("/v1/fitness/workout", body),
  getHistory:   (days = 30)  => api.get(`/v1/fitness/history?days=${days}`),
};

export const nutritionAPI = {
  logMeal:    (body)         => api.post("/v1/nutrition/meal",  body),
  addWater:   (amount_ml)    => api.post("/v1/nutrition/water", { amount_ml }),
  getToday:   ()             => api.get("/v1/nutrition/today"),
};