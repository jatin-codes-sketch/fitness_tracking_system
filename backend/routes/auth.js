/**
 * VitalityHub — Auth Routes
 * POST /v1/auth/register
 * POST /v1/auth/login
 */
import { Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validate } from "../middleware/validate.js";
import { settings } from "../config/settings.js";

const router = Router();

// ── Helpers ────────────────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, settings.JWT_SECRET, {
    expiresIn: settings.JWT_EXPIRES,
  });
}

// ── Validators ─────────────────────────────────────────────────────────────
const registerValidators = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("biometrics.age").isInt({ min: 10, max: 120 }).withMessage("Age must be 10–120."),
  body("biometrics.weight_kg").isFloat({ min: 1, max: 500 }).withMessage("Weight must be 1–500 kg."),
  body("biometrics.height_cm").isFloat({ min: 50, max: 300 }).withMessage("Height must be 50–300 cm."),
  body("biometrics.gender").isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other."),
  body("biometrics.fitness_goal").isIn(["loss", "gain", "maintain"]).withMessage("Goal must be loss, gain, or maintain."),
];

const loginValidators = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("password").notEmpty().withMessage("Password is required."),
];

// ── POST /v1/auth/register ─────────────────────────────────────────────────
router.post("/register", registerValidators, validate, async (req, res, next) => {
  try {
    const { email, password, biometrics } = req.body;

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ detail: "Email already registered." });
    }

    // Hash password
    const password_hash = await User.hashPassword(password);

    // Create user
    const user = new User({ email, password_hash, biometrics });
    user.deriveCaloricGoal();
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({
      access_token: token,
      token_type:   "bearer",
      caloric_goal: user.caloric_goal,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /v1/auth/login ────────────────────────────────────────────────────
router.post("/login", loginValidators, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ detail: "Invalid credentials." });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ detail: "Invalid credentials." });
    }

    const token = signToken(user._id);
    res.json({
      access_token: token,
      token_type:   "bearer",
      caloric_goal: user.caloric_goal,
    });
  } catch (err) {
    next(err);
  }
});

export default router;