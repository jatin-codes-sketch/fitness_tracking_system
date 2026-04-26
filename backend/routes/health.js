/**
 * VitalityHub — Health Routes
 * POST /v1/health/vitals   — log a vital-signs reading
 * GET  /v1/health/stats    — retrieve time-series stats
 */
import { Router } from "express";
import { body, query } from "express-validator";
import HealthRecord from "../models/HealthRecord.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(authenticate);

// ── Validators ─────────────────────────────────────────────────────────────
const vitalsValidators = [
  body("heart_rate").optional().isInt({ min: 30, max: 250 }).withMessage("Heart rate must be 30–250 bpm."),
  body("blood_pressure_sys").optional().isInt({ min: 60, max: 250 }).withMessage("Systolic BP must be 60–250 mmHg."),
  body("blood_pressure_dia").optional().isInt({ min: 40, max: 150 }).withMessage("Diastolic BP must be 40–150 mmHg."),
  body("blood_sugar").optional().isFloat({ min: 0, max: 60 }).withMessage("Blood sugar must be 0–60 mmol/L."),
  body("spo2").optional().isFloat({ min: 0, max: 100 }).withMessage("SpO2 must be 0–100%."),
  body("notes").optional().isLength({ max: 500 }).withMessage("Notes max 500 chars."),
];

// ── POST /v1/health/vitals ─────────────────────────────────────────────────
router.post("/vitals", vitalsValidators, validate, async (req, res, next) => {
  try {
    const { heart_rate, blood_pressure_sys, blood_pressure_dia, blood_sugar, spo2, notes } = req.body;

    // At least one vital must be provided
    if (!heart_rate && !blood_pressure_sys && !blood_sugar && !spo2) {
      return res.status(422).json({ detail: "At least one vital sign must be provided." });
    }

    const record = await HealthRecord.create({
      user_id: req.user_id,
      heart_rate:         heart_rate         ?? null,
      blood_pressure_sys: blood_pressure_sys ?? null,
      blood_pressure_dia: blood_pressure_dia ?? null,
      blood_sugar:        blood_sugar        ?? null,
      spo2:               spo2               ?? null,
      notes:              notes              ?? null,
    });

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

// ── GET /v1/health/stats ───────────────────────────────────────────────────
router.get(
  "/stats",
  [query("days").optional().isInt({ min: 1, max: 365 }).toInt()],
  validate,
  async (req, res, next) => {
    try {
      const days  = req.query.days || 30;
      const since = new Date(Date.now() - days * 86_400_000);

      const records = await HealthRecord.find({
        user_id:   req.user_id,
        timestamp: { $gte: since },
      })
        .sort({ timestamp: -1 })
        .lean();

      // Compute averages (null values excluded)
      const avg = (arr) => {
        const clean = arr.filter((v) => v !== null && v !== undefined);
        return clean.length ? parseFloat((clean.reduce((a, b) => a + b, 0) / clean.length).toFixed(1)) : null;
      };

      res.json({
        records,
        avg_heart_rate:  avg(records.map((r) => r.heart_rate)),
        avg_blood_sugar: avg(records.map((r) => r.blood_sugar)),
        avg_bp_sys:      avg(records.map((r) => r.blood_pressure_sys)),
        avg_bp_dia:      avg(records.map((r) => r.blood_pressure_dia)),
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;