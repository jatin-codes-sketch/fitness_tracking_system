/**
 * VitalityHub — HealthRecord Model
 * Collection: health_records
 * Stores one vital-signs reading per document.
 */
import mongoose from "mongoose";

const HealthRecordSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    heart_rate:          { type: Number, min: 30,  max: 250, default: null },
    blood_pressure_sys:  { type: Number, min: 60,  max: 250, default: null },
    blood_pressure_dia:  { type: Number, min: 40,  max: 150, default: null },
    blood_sugar:         { type: Number, min: 0,   max: 60,  default: null },
    spo2:                { type: Number, min: 0,   max: 100, default: null },

    notes:     { type: String, maxlength: 500, default: null },
    timestamp: { type: Date,   default: Date.now, index: true },
  },
  { timestamps: false }
);

// Compound index for efficient time-series queries per user
HealthRecordSchema.index({ user_id: 1, timestamp: -1 });

export default mongoose.model("HealthRecord", HealthRecordSchema);