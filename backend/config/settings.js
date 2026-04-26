/**
 * VitalityHub — App Configuration
 * Reads from process.env / .env file via dotenv.
 */
import "dotenv/config";

const required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
};

export const settings = {
  // ── Server ────────────────────────────────────────────────
  PORT: parseInt(process.env.PORT || "8000"),
  NODE_ENV: process.env.NODE_ENV || "development",

  // ── MongoDB ───────────────────────────────────────────────
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  MONGO_DB:  process.env.MONGO_DB_NAME || "vitalityhub",

  // ── JWT ───────────────────────────────────────────────────
  JWT_SECRET:  process.env.SECRET_KEY || "change-me-in-production",
  JWT_EXPIRES: process.env.JWT_EXPIRES || "24h",

  // ── CORS ──────────────────────────────────────────────────
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
    .split(",")
    .map(s => s.trim()),
};