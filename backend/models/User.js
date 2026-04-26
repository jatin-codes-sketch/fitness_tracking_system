/**
 * VitalityHub — User Model
 * Collection: users
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Sub-schemas ───────────────────────────────────────────────────────────
const BiometricsSchema = new mongoose.Schema(
  {
    age:          { type: Number, required: true, min: 10, max: 120 },
    weight_kg:    { type: Number, required: true, min: 1,  max: 500 },
    height_cm:    { type: Number, required: true, min: 50, max: 300 },
    gender:       { type: String, required: true, enum: ["male", "female", "other"] },
    fitness_goal: { type: String, required: true, enum: ["loss", "gain", "maintain"] },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    biometrics:    { type: BiometricsSchema, default: null },
    caloric_goal:  { type: Number, default: null },
    is_active:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });

// ── Instance methods ──────────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password_hash);
};

/**
 * Mifflin-St Jeor BMR × 1.375 (lightly active) + goal offset.
 * Called after setting biometrics.
 */
UserSchema.methods.deriveCaloricGoal = function () {
  if (!this.biometrics) return;
  const { age, weight_kg, height_cm, gender, fitness_goal } = this.biometrics;
  const bmr =
    gender === "male"
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  const tdee = Math.round(bmr * 1.375);
  const offsets = { loss: -500, gain: +300, maintain: 0 };
  this.caloric_goal = tdee + (offsets[fitness_goal] ?? 0);
};

// ── Static helpers ────────────────────────────────────────────────────────
UserSchema.statics.hashPassword = async (plain) =>
  bcrypt.hash(plain, 12);

// ── Hide password in JSON output ──────────────────────────────────────────
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

export default mongoose.model("User", UserSchema);