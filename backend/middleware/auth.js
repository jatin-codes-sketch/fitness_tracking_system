/**
 * VitalityHub — JWT Auth Middleware
 * Verifies Bearer token and attaches user_id to req.
 */
import jwt from "jsonwebtoken";
import { settings } from "../config/settings.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Missing or invalid Authorization header." });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, settings.JWT_SECRET);
    req.user_id = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({
      detail: err.name === "TokenExpiredError"
        ? "Token has expired. Please log in again."
        : "Invalid token.",
    });
  }
}