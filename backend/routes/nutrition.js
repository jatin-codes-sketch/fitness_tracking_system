/**
 * VitalityHub — Nutrition Routes
 * POST /v1/nutrition/meal    — log a meal
 * POST /v1/nutrition/water   — add water intake (250 or 500 ml)
 * GET  /v1/nutrition/today   — today's diet summary
 */
import { Router } from "express";
import { body } from "express-validator";
import DietLog from "../models/DietLog.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(authenticate);

// ── Helpers ────────────────────────────────────────────────────────────────
function todayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

async function getOrCreateLog(user_id, date) {
  let log = await DietLog.findOne({ user_id, date });
  if (!log) {
    log = await DietLog.create({ user_id, date });
  }
  return log;
}

// ── Validators ─────────────────────────────────────────────────────────────
const mealValidators = [
  body("meal_type").isIn(["breakfast", "lunch", "dinner", "snack"]).withMessage("Invalid meal type."),
  body("name").trim().notEmpty().withMessage("Meal name is required."),
  body("calories").isFloat({ min: 0 }).withMessage("Calories must be >= 0."),
  body("protein_g").optional().isFloat({ min: 0 }).withMessage("Protein must be >= 0."),
  body("carbs_g").optional().isFloat({ min: 0 }).withMessage("Carbs must be >= 0."),
  body("fat_g").optional().isFloat({ min: 0 }).withMessage("Fat must be >= 0."),
];

const waterValidators = [
  body("amount_ml")
    .isInt()
    .withMessage("amount_ml must be an integer.")
    .custom((v) => {
      if (![250, 500].includes(parseInt(v))) throw new Error("amount_ml must be 250 or 500.");
      return true;
    }),
];

// ── POST /v1/nutrition/meal ────────────────────────────────────────────────
router.post("/meal", mealValidators, validate, async (req, res, next) => {
  try {
    const { meal_type, name, calories, protein_g = 0, carbs_g = 0, fat_g = 0 } = req.body;
    const today = todayString();
    const log   = await getOrCreateLog(req.user_id, today);

    log.meal_list.push({ meal_type, name, calories, protein_g, carbs_g, fat_g });
    await log.save();

    res.status(201).json({
      message:              "Meal logged.",
      total_calories_today: log.total_calories,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /v1/nutrition/water ───────────────────────────────────────────────
router.post("/water", waterValidators, validate, async (req, res, next) => {
  try {
    const amount_ml = parseInt(req.body.amount_ml);
    const today     = todayString();
    const log       = await getOrCreateLog(req.user_id, today);

    log.total_water_ml += amount_ml;
    await log.save();

    res.json({
      message:        `+${amount_ml}ml added.`,
      total_water_ml: log.total_water_ml,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /v1/nutrition/today ────────────────────────────────────────────────
router.get("/today", async (req, res, next) => {
  try {
    const today = todayString();
    const log   = await DietLog.findOne({ user_id: req.user_id, date: today });

    if (!log) {
      return res.json({
        date:           today,
        total_calories: 0,
        total_protein_g:0,
        total_carbs_g:  0,
        total_fat_g:    0,
        total_water_ml: 0,
        meal_list:      [],
      });
    }

    // toJSON triggers virtuals
    const data = log.toJSON();
    res.json({
      date:            data.date,
      total_calories:  data.total_calories,
      total_protein_g: data.total_protein_g,
      total_carbs_g:   data.total_carbs_g,
      total_fat_g:     data.total_fat_g,
      total_water_ml:  data.total_water_ml,
      meal_list:       data.meal_list,
    });
  } catch (err) {
    next(err);
  }
});

export default router;