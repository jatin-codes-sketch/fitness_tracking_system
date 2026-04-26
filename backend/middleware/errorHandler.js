/**
 * VitalityHub — Global Error Handler
 * Catches all errors passed via next(err).
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const detail = err.message || "Internal Server Error";

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ detail: `${field} already exists.` });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const msgs = Object.values(err.errors).map(e => e.message).join(", ");
    return res.status(422).json({ detail: msgs });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ detail: "Invalid or expired token." });
  }

  console.error(`[${req.method}] ${req.path} → ${status}: ${detail}`);
  res.status(status).json({ detail });
}