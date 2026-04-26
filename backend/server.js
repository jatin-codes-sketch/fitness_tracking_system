/**
 * VitalityHub — Express Server Entry Point
 * Node.js + Express + Mongoose
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { settings }      from "./config/settings.js";
import { connectDB }     from "./config/db.js";
import { errorHandler }  from "./middleware/errorHandler.js";

import authRouter      from "./routes/auth.js";
import healthRouter    from "./routes/health.js";
import fitnessRouter   from "./routes/fitness.js";
import nutritionRouter from "./routes/nutrition.js";

// ── App factory ───────────────────────────────────────────────────────────
const app = express();

// ── Security middleware ───────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      settings.ALLOWED_ORIGINS,
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Rate limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { detail: "Too many requests. Please try again later." },
});
app.use(limiter);

// ── Body parsing & compression ────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────
if (settings.NODE_ENV !== "test") {
  app.use(morgan(settings.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Health check ──────────────────────────────────────────────────────────
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", service: "VitalityHub", version: "1.0.0" });
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use("/v1/auth",      authRouter);
app.use("/v1/health",    healthRouter);
app.use("/v1/fitness",   fitnessRouter);
app.use("/v1/nutrition", nutritionRouter);

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ detail: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(settings.PORT, "0.0.0.0", () => {
    console.log(`🚀  VitalityHub API running on http://0.0.0.0:${settings.PORT}`);
    console.log(`📋  Environment: ${settings.NODE_ENV}`);
    console.log(`🌐  Allowed origins: ${settings.ALLOWED_ORIGINS.join(", ")}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;