import mongoose from "mongoose";


const MealSchema = new mongoose.Schema(
  {
    meal_type:  {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner", "snack"],
    },
    name:       { type: String, required: true, trim: true },
    calories:   { type: Number, required: true, min: 0 },
    protein_g:  { type: Number, default: 0, min: 0 },
    carbs_g:    { type: Number, default: 0, min: 0 },
    fat_g:      { type: Number, default: 0, min: 0 },
    logged_at:  { type: Date, default: Date.now },
  },
  { _id: false }
);


const DietLogSchema = new mongoose.Schema(
  {
    user_id:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date:          { type: String, required: true },  
    meal_list:     { type: [MealSchema], default: [] },
    total_water_ml:{ type: Number, default: 0, min: 0 },
  },
  {
    timestamps: false,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);


DietLogSchema.index({ user_id: 1, date: -1 });
DietLogSchema.index({ user_id: 1, date: 1 }, { unique: true });


DietLogSchema.virtual("total_calories").get(function () {
  return parseFloat(
    this.meal_list.reduce((a, m) => a + m.calories, 0).toFixed(1)
  );
});

DietLogSchema.virtual("total_protein_g").get(function () {
  return parseFloat(
    this.meal_list.reduce((a, m) => a + m.protein_g, 0).toFixed(1)
  );
});

DietLogSchema.virtual("total_carbs_g").get(function () {
  return parseFloat(
    this.meal_list.reduce((a, m) => a + m.carbs_g, 0).toFixed(1)
  );
});

DietLogSchema.virtual("total_fat_g").get(function () {
  return parseFloat(
    this.meal_list.reduce((a, m) => a + m.fat_g, 0).toFixed(1)
  );
});

export default mongoose.model("DietLog", DietLogSchema);