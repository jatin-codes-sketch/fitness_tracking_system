/**
 * VitalityHub — Validation Middleware
 * Reads express-validator results and returns 422 on failure.
 */
import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(422).json({
      detail: first.msg,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}