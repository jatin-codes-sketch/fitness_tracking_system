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

const vitalsValidators = [
  body("heart_rate").optional().isInt({ min: 30, max: 250 }),
  body("blood_pressure_sys").optional().isInt({ min: 60, max: 250 }),
  body("blood_pressure_dia").optional().isInt({ min: 40, max: 150 }),
  body("blood_sugar").optional().isFloat({ min: 0, max: 60 }),
  body("spo2").optional().isFloat({ min: 0, max: 100 }),
  body("notes").optional().isLength({ max: 500 }),
];

router.post("/vitals", vitalsValidators, validate, async (req, res, next) => {
  try {
    const { heart_rate, blood_pressure_sys, blood_pressure_dia, blood_sugar, spo2, notes } = req.body;

    if (
      heart_rate == null &&
      blood_pressure_sys == null &&
      blood_sugar == null &&
      spo2 == null
    ) {
      return res.status(422).json({ detail: "At least one vital sign must be provided." });
    }

    const doc = {
      user_id: req.user_id,
      heart_rate: heart_rate ?? null,
      blood_pressure_sys: blood_pressure_sys ?? null,
      blood_pressure_dia: blood_pressure_dia ?? null,
      blood_sugar: blood_sugar ?? null,
      spo2: spo2 ?? null,
      notes: notes ?? null,
      timestamp: new Date(),
    };

    const result = await HealthRecord.collection.insertOne(doc);
    const insertedDoc = await HealthRecord.findById(result.insertedId);

    res.status(201).json(insertedDoc);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/stats",
  [query("days").optional().isInt({ min: 1, max: 365 }).toInt()],
  validate,
  async (req, res, next) => {
    try {
      const days = req.query.days || 30;
      const since = new Date(Date.now() - days * 86_400_000);

      const cursor = HealthRecord.collection.find({
        user_id: req.user_id,
        timestamp: { $gte: since },
      });

      const records = await cursor.sort({ timestamp: -1 }).toArray();

      const avg = (arr) => {
        const clean = arr.filter((v) => v !== null && v !== undefined);
        return clean.length
          ? parseFloat((clean.reduce((a, b) => a + b, 0) / clean.length).toFixed(1))
          : null;
      };

      res.json({
        records,
        avg_heart_rate: avg(records.map((r) => r.heart_rate)),
        avg_blood_sugar: avg(records.map((r) => r.blood_sugar)),
        avg_bp_sys: avg(records.map((r) => r.blood_pressure_sys)),
        avg_bp_dia: avg(records.map((r) => r.blood_pressure_dia)),
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;