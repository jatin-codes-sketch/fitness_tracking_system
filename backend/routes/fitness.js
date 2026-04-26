/**
 * VitalityHub — Fitness Routes
 * POST /v1/fitness/workout   — log a workout session
 * GET  /v1/fitness/history   — retrieve workout history
 */
import { Router } from "express";
import { body, query } from "express-validator";
import WorkoutSession from "../models/WorkoutSession.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(authenticate);

// ── Validators ─────────────────────────────────────────────────────────────
const workoutValidators = [
  body("workout_name").trim().notEmpty().withMessage("Workout name is required."),
  body("exercise_list").isArray().withMessage("exercise_list must be an array."),
  body("exercise_list.*.name").trim().notEmpty().withMessage("Exercise name is required."),
  body("exercise_list.*.sets").isArray().withMessage("Sets must be an array."),
  body("exercise_list.*.sets.*.set_number").isInt({ min: 1 }).withMessage("Set number must be >= 1."),
  body("exercise_list.*.sets.*.reps").isInt({ min: 0 }).withMessage("Reps must be >= 0."),
  body("exercise_list.*.sets.*.weight_kg").isFloat({ min: 0 }).withMessage("Weight must be >= 0."),
  body("calories_burned").optional().isFloat({ min: 0 }).withMessage("Calories must be >= 0."),
  body("duration_minutes").optional().isInt({ min: 1 }).withMessage("Duration must be >= 1 min."),
];

// ── POST /v1/fitness/workout ───────────────────────────────────────────────
router.post("/workout", workoutValidators, validate, async (req, res, next) => {
  try {
    const { workout_name, exercise_list, calories_burned, duration_minutes, notes } = req.body;

    const session = await WorkoutSession.create({
      user_id:          req.user_id,
      workout_name,
      exercise_list:    exercise_list || [],
      calories_burned:  calories_burned  ?? null,
      duration_minutes: duration_minutes ?? null,
      notes:            notes            ?? null,
    });

    // Return with computed virtuals
    res.status(201).json(session.toJSON());
  } catch (err) {
    next(err);
  }
});

// ── GET /v1/fitness/history ────────────────────────────────────────────────
router.get(
  "/history",
  [query("days").optional().isInt({ min: 1, max: 365 }).toInt()],
  validate,
  async (req, res, next) => {
    try {
      const days  = req.query.days || 30;
      const since = new Date(Date.now() - days * 86_400_000);

      const sessions = await WorkoutSession.find({
        user_id:   req.user_id,
        timestamp: { $gte: since },
      })
        .sort({ timestamp: -1 });

      // toJSON triggers virtuals
      res.json(sessions.map((s) => s.toJSON()));
    } catch (err) {
      next(err);
    }
  }
);

export default router;