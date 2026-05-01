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

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

const mealValidators = [
  body("meal_type").isIn(["breakfast", "lunch", "dinner", "snack"]),
  body("name").trim().notEmpty(),
  body("calories").isFloat({ min: 0 }),
  body("protein_g").optional().isFloat({ min: 0 }),
  body("carbs_g").optional().isFloat({ min: 0 }),
  body("fat_g").optional().isFloat({ min: 0 }),
];

const waterValidators = [
  body("amount_ml")
    .isInt()
    .custom((v) => {
      if (![250, 500].includes(parseInt(v))) throw new Error();
      return true;
    }),
];

router.post("/meal", mealValidators, validate, async (req, res, next) => {
  try {
    const { meal_type, name, calories, protein_g = 0, carbs_g = 0, fat_g = 0 } = req.body;

    const today = todayString();

    const meal = { meal_type, name, calories, protein_g, carbs_g, fat_g };

    await DietLog.collection.updateOne(
      { user_id: req.user_id, date: today },
      {
        $push: { meal_list: meal },
        $setOnInsert: {
          user_id: req.user_id,
          date: today,
          total_water_ml: 0,
        },
      },
      { upsert: true }
    );

    const log = await DietLog.collection.findOne({ user_id: req.user_id, date: today });
    const updatedDoc = new DietLog(log);

    res.status(201).json({
      message: "Meal logged.",
      total_calories_today: updatedDoc.total_calories,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/water", waterValidators, validate, async (req, res, next) => {
  try {
    const amount_ml = parseInt(req.body.amount_ml);
    const today = todayString();

    await DietLog.collection.updateOne(
      { user_id: req.user_id, date: today },
      {
        $inc: { total_water_ml: amount_ml },
        $setOnInsert: {
          user_id: req.user_id,
          date: today,
          meal_list: [],
        },
      },
      { upsert: true }
    );

    const log = await DietLog.collection.findOne({ user_id: req.user_id, date: today });
    const updatedDoc = new DietLog(log);

    res.json({
      message: `+${amount_ml}ml added.`,
      total_water_ml: updatedDoc.total_water_ml,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/today", async (req, res, next) => {
  try {
    const today = todayString();

    const log = await DietLog.collection.findOne({
      user_id: req.user_id,
      date: today,
    });

    if (!log) {
      return res.json({
        date: today,
        total_calories: 0,
        total_protein_g: 0,
        total_carbs_g: 0,
        total_fat_g: 0,
        total_water_ml: 0,
        meal_list: [],
      });
    }

    const doc = new DietLog(log);
    const data = doc.toJSON();

    res.json({
      date: data.date,
      total_calories: data.total_calories,
      total_protein_g: data.total_protein_g,
      total_carbs_g: data.total_carbs_g,
      total_fat_g: data.total_fat_g,
      total_water_ml: data.total_water_ml,
      meal_list: data.meal_list,
    });
  } catch (err) {
    next(err);
  }
});

export default router;