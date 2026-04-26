/**
 * VitalityHub — WorkoutSession Model
 * Collection: workout_sessions
 * Auto-calculates total volume per session via virtual fields.
 */
import mongoose from "mongoose";

// ── Sub-schemas ───────────────────────────────────────────────────────────
const ExerciseSetSchema = new mongoose.Schema(
  {
    set_number: { type: Number, required: true, min: 1 },
    reps:       { type: Number, default: 0, min: 0 },
    weight_kg:  { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sets: { type: [ExerciseSetSchema], default: [] },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────
const WorkoutSessionSchema = new mongoose.Schema(
  {
    user_id:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workout_name: { type: String, required: true, trim: true },
    exercise_list:    { type: [ExerciseSchema], default: [] },
    calories_burned:  { type: Number, min: 0, default: null },
    duration_minutes: { type: Number, min: 1, default: null },
    notes:        { type: String, maxlength: 1000, default: null },
    timestamp:    { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────
WorkoutSessionSchema.index({ user_id: 1, timestamp: -1 });

// ── Virtuals (computed on read, not stored) ───────────────────────────────
WorkoutSessionSchema.virtual("total_volume_kg").get(function () {
  return parseFloat(
    this.exercise_list
      .reduce(
        (total, ex) =>
          total + ex.sets.reduce((sum, s) => sum + s.reps * s.weight_kg, 0),
        0
      )
      .toFixed(2)
  );
});

WorkoutSessionSchema.virtual("total_sets").get(function () {
  return this.exercise_list.reduce((t, ex) => t + ex.sets.length, 0);
});

WorkoutSessionSchema.virtual("total_reps").get(function () {
  return this.exercise_list.reduce(
    (t, ex) => t + ex.sets.reduce((s, set) => s + set.reps, 0),
    0
  );
});

export default mongoose.model("WorkoutSession", WorkoutSessionSchema);