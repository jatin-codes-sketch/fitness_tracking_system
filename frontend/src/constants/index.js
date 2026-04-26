/**
 * VitalityHub — Single Source of Truth
 * ─────────────────────────────────────
 * All static data, config, and lookup tables live here.
 * Import from "@/constants" anywhere in the app.
 *
 * Sections:
 *  1.  App Config
 *  2.  Theme & Colors
 *  3.  Navigation
 *  4.  Exercise Database (75+ exercises, 4 types)
 *  5.  Calorie Calculator Logic
 *  6.  Meal & Nutrition Config
 *  7.  User Biometric Config
 *  8.  Vitals Reference Ranges
 *  9.  Hydration Config
 *  10. Greeting Util
 */


// ══════════════════════════════════════════════════════════════
// 1. APP CONFIG
// ══════════════════════════════════════════════════════════════
export const APP = {
  name:           "VitalityHub",
  version:        "1.0.0",
  waterGoalMl:    2500,
  defaultCalGoal: 2000,
  tokenKey:       "vh_token",
  userKey:        "vh_user",
  themeKey:       "vh_theme",
  notifKey:       "vh_notif",
};


// ══════════════════════════════════════════════════════════════
// 2. THEME & COLORS
// ══════════════════════════════════════════════════════════════
export const COLORS = {
  accent:  "#22d3ee",  // cyan   — primary / water
  violet:  "#a78bfa",  // violet — secondary / BP
  emerald: "#34d399",  // green  — success / SpO2
  amber:   "#fb923c",  // orange — calories / warnings
  danger:  "#f87171",  // red    — heart rate / alerts
  muted:   "#64748b",
};

export const VITAL_COLORS = {
  heartRate:     "#f87171",
  bloodSugar:    "#fb923c",
  bloodPressure: "#a78bfa",
  spo2:          "#34d399",
  water:         "#22d3ee",
  protein:       "#22d3ee",
  carbs:         "#a78bfa",
  fat:           "#fb923c",
};

export const MACRO_COLORS = {
  protein: "#22d3ee",
  carbs:   "#a78bfa",
  fat:     "#fb923c",
};


// ══════════════════════════════════════════════════════════════
// 3. NAVIGATION & HISTORY FILTERS
// ══════════════════════════════════════════════════════════════
export const NAV_ROUTES = [
  { path:"/",          label:"Dashboard" },
  { path:"/log",       label:"Log"       },
  { path:"/history",   label:"History"   },
  { path:"/nutrition", label:"Nutrition" },
  { path:"/profile",   label:"Profile"   },
];

export const HISTORY_DAY_OPTIONS = [
  { value:7,  label:"1 week"   },
  { value:30, label:"1 month"  },
  { value:60, label:"2 months" },
  { value:90, label:"3 months" },
];


// ══════════════════════════════════════════════════════════════
// 4. EXERCISE DATABASE
// ══════════════════════════════════════════════════════════════
/**
 * Exercise types:
 *  "weighted"   → sets × reps × weight(kg)     — MET-based calorie estimate
 *  "bodyweight" → sets × reps (no weight)       — calsPerRep estimate
 *  "cardio"     → distance(km) + duration(min)  — MET-based estimate
 *  "timed"      → duration(sec)                 — calsPerMin estimate
 *   null        → Custom free-text entry
 */
export const EXERCISE_TYPES = {
  weighted:   { label:"🏋️ Weighted",  color:"#a78bfa", description:"Sets × reps × kg"        },
  bodyweight: { label:"💪 Bodyweight", color:"#34d399", description:"Sets × reps, no weight"  },
  cardio:     { label:"🏃 Cardio",     color:"#22d3ee", description:"Distance + duration"     },
  timed:      { label:"⏱️ Timed",      color:"#fb923c", description:"Hold/sustain in seconds" },
};

export const EXERCISES = [
  // ── WEIGHTED — CHEST ──────────────────────────────────────
  { name:"Bench Press",          type:"weighted", group:"Chest",     met:5.0 },
  { name:"Incline Bench Press",  type:"weighted", group:"Chest",     met:5.0 },
  { name:"Decline Press",        type:"weighted", group:"Chest",     met:5.0 },
  { name:"Cable Fly",            type:"weighted", group:"Chest",     met:4.0 },
  { name:"Chest Dip (Weighted)", type:"weighted", group:"Chest",     met:5.5 },
  { name:"Pec Deck Machine",     type:"weighted", group:"Chest",     met:4.0 },

  // ── WEIGHTED — LEGS ───────────────────────────────────────
  { name:"Squat",                type:"weighted", group:"Legs",      met:6.0 },
  { name:"Front Squat",          type:"weighted", group:"Legs",      met:6.0 },
  { name:"Leg Press",            type:"weighted", group:"Legs",      met:5.0 },
  { name:"Leg Curl",             type:"weighted", group:"Legs",      met:4.0 },
  { name:"Leg Extension",        type:"weighted", group:"Legs",      met:4.0 },
  { name:"Romanian Deadlift",    type:"weighted", group:"Legs",      met:5.5 },
  { name:"Calf Raise",           type:"weighted", group:"Legs",      met:3.5 },
  { name:"Hack Squat",           type:"weighted", group:"Legs",      met:5.5 },
  { name:"Sumo Deadlift",        type:"weighted", group:"Legs",      met:6.0 },

  // ── WEIGHTED — BACK ───────────────────────────────────────
  { name:"Deadlift",             type:"weighted", group:"Back",      met:6.0 },
  { name:"Barbell Row",          type:"weighted", group:"Back",      met:5.0 },
  { name:"Seated Cable Row",     type:"weighted", group:"Back",      met:4.5 },
  { name:"Lat Pulldown",         type:"weighted", group:"Back",      met:4.5 },
  { name:"Single Arm Row",       type:"weighted", group:"Back",      met:4.5 },
  { name:"T-Bar Row",            type:"weighted", group:"Back",      met:5.0 },

  // ── WEIGHTED — SHOULDERS ──────────────────────────────────
  { name:"Overhead Press",       type:"weighted", group:"Shoulders", met:5.0 },
  { name:"Lateral Raise",        type:"weighted", group:"Shoulders", met:3.5 },
  { name:"Front Raise",          type:"weighted", group:"Shoulders", met:3.5 },
  { name:"Rear Delt Fly",        type:"weighted", group:"Shoulders", met:3.5 },
  { name:"Arnold Press",         type:"weighted", group:"Shoulders", met:5.0 },

  // ── WEIGHTED — ARMS ───────────────────────────────────────
  { name:"Bicep Curl",           type:"weighted", group:"Arms",      met:4.0 },
  { name:"Hammer Curl",          type:"weighted", group:"Arms",      met:4.0 },
  { name:"Preacher Curl",        type:"weighted", group:"Arms",      met:4.0 },
  { name:"Tricep Pushdown",      type:"weighted", group:"Arms",      met:4.0 },
  { name:"Skull Crusher",        type:"weighted", group:"Arms",      met:4.0 },
  { name:"Close Grip Bench",     type:"weighted", group:"Arms",      met:4.5 },

  // ── WEIGHTED — CORE ───────────────────────────────────────
  { name:"Cable Crunch",         type:"weighted", group:"Core",      met:3.5 },
  { name:"Weighted Sit Up",      type:"weighted", group:"Core",      met:3.5 },
  { name:"Ab Wheel Rollout",     type:"weighted", group:"Core",      met:4.0 },

  // ── BODYWEIGHT — PUSH ────────────────────────────────────
  { name:"Push Up",              type:"bodyweight", group:"Chest",     calsPerRep:0.50 },
  { name:"Diamond Push Up",      type:"bodyweight", group:"Arms",      calsPerRep:0.50 },
  { name:"Wide Push Up",         type:"bodyweight", group:"Chest",     calsPerRep:0.50 },
  { name:"Pike Push Up",         type:"bodyweight", group:"Shoulders", calsPerRep:0.50 },
  { name:"Dip",                  type:"bodyweight", group:"Chest",     calsPerRep:0.70 },
  { name:"Tricep Dip",           type:"bodyweight", group:"Arms",      calsPerRep:0.65 },

  // ── BODYWEIGHT — PULL ────────────────────────────────────
  { name:"Pull Up",              type:"bodyweight", group:"Back",      calsPerRep:1.00 },
  { name:"Chin Up",              type:"bodyweight", group:"Back",      calsPerRep:0.90 },
  { name:"Inverted Row",         type:"bodyweight", group:"Back",      calsPerRep:0.60 },

  // ── BODYWEIGHT — LEGS ────────────────────────────────────
  { name:"Bodyweight Squat",     type:"bodyweight", group:"Legs",      calsPerRep:0.40 },
  { name:"Jump Squat",           type:"bodyweight", group:"Legs",      calsPerRep:0.80 },
  { name:"Lunge",                type:"bodyweight", group:"Legs",      calsPerRep:0.50 },
  { name:"Reverse Lunge",        type:"bodyweight", group:"Legs",      calsPerRep:0.50 },
  { name:"Glute Bridge",         type:"bodyweight", group:"Legs",      calsPerRep:0.30 },
  { name:"Hip Thrust",           type:"bodyweight", group:"Legs",      calsPerRep:0.35 },
  { name:"Step Up",              type:"bodyweight", group:"Legs",      calsPerRep:0.45 },
  { name:"Calf Raise (BW)",      type:"bodyweight", group:"Legs",      calsPerRep:0.15 },

  // ── BODYWEIGHT — CORE ────────────────────────────────────
  { name:"Sit Up",               type:"bodyweight", group:"Core",      calsPerRep:0.40 },
  { name:"Crunch",               type:"bodyweight", group:"Core",      calsPerRep:0.30 },
  { name:"Leg Raise",            type:"bodyweight", group:"Core",      calsPerRep:0.35 },
  { name:"Russian Twist",        type:"bodyweight", group:"Core",      calsPerRep:0.25 },
  { name:"Mountain Climber",     type:"bodyweight", group:"Core",      calsPerRep:0.30 },
  { name:"Bicycle Crunch",       type:"bodyweight", group:"Core",      calsPerRep:0.30 },
  { name:"Hollow Body Rock",     type:"bodyweight", group:"Core",      calsPerRep:0.25 },

  // ── BODYWEIGHT — FULL BODY / CARDIO ──────────────────────
  { name:"Burpee",               type:"bodyweight", group:"Full Body", calsPerRep:1.50 },
  { name:"Jumping Jack",         type:"bodyweight", group:"Cardio",    calsPerRep:0.20 },
  { name:"High Knee",            type:"bodyweight", group:"Cardio",    calsPerRep:0.25 },
  { name:"Box Jump",             type:"bodyweight", group:"Full Body", calsPerRep:1.00 },
  { name:"Bear Crawl",           type:"bodyweight", group:"Full Body", calsPerRep:0.80 },

  // ── CARDIO ────────────────────────────────────────────────
  { name:"Running",              type:"cardio", met:9.8  },
  { name:"Jogging",              type:"cardio", met:7.0  },
  { name:"Sprinting",            type:"cardio", met:14.0 },
  { name:"Cycling (Outdoor)",    type:"cardio", met:7.5  },
  { name:"Cycling (Stationary)", type:"cardio", met:6.8  },
  { name:"Walking",              type:"cardio", met:3.5  },
  { name:"Brisk Walking",        type:"cardio", met:4.5  },
  { name:"Hiking",               type:"cardio", met:6.0  },
  { name:"Swimming",             type:"cardio", met:8.0  },
  { name:"Rowing Machine",       type:"cardio", met:7.0  },
  { name:"Jump Rope",            type:"cardio", met:11.0 },
  { name:"Elliptical",           type:"cardio", met:5.0  },
  { name:"Stair Climbing",       type:"cardio", met:9.0  },
  { name:"Treadmill Walk",       type:"cardio", met:4.0  },
  { name:"HIIT",                 type:"cardio", met:10.0 },
  { name:"Kickboxing",           type:"cardio", met:8.3  },

  // ── TIMED ─────────────────────────────────────────────────
  { name:"Plank",                type:"timed", group:"Core", calsPerMin:3.5 },
  { name:"Side Plank",           type:"timed", group:"Core", calsPerMin:3.0 },
  { name:"Wall Sit",             type:"timed", group:"Legs", calsPerMin:4.0 },
  { name:"Dead Hang",            type:"timed", group:"Back", calsPerMin:3.0 },
  { name:"L-Sit",                type:"timed", group:"Core", calsPerMin:4.5 },
  { name:"Superman Hold",        type:"timed", group:"Back", calsPerMin:2.5 },
  { name:"Hollow Body Hold",     type:"timed", group:"Core", calsPerMin:3.8 },
  { name:"Horse Stance",         type:"timed", group:"Legs", calsPerMin:3.5 },

  // ── CUSTOM ────────────────────────────────────────────────
  { name:"Custom", type:null },
];

/** Look up a single exercise by name */
export const getExercise = (name) =>
  EXERCISES.find(e => e.name === name) || null;

/** Get exercises grouped: { weighted: { Chest:[...], Back:[...] }, ... } */
export const getGroupedExercises = () => {
  const result = {};
  EXERCISES.forEach(ex => {
    const typeKey  = ex.type || "custom";
    const groupKey = ex.group || "Other";
    if (!result[typeKey]) result[typeKey] = {};
    if (!result[typeKey][groupKey]) result[typeKey][groupKey] = [];
    result[typeKey][groupKey].push(ex);
  });
  return result;
};


// ══════════════════════════════════════════════════════════════
// 5. CALORIE CALCULATOR
// ══════════════════════════════════════════════════════════════

/**
 * Estimate calories burned for one exercise entry.
 * @param {string} name         - exercise name (must exist in EXERCISES)
 * @param {object} data         - { sets, duration_min, distance_km, duration_sec }
 * @param {number} userWeightKg - user body weight
 */
export function calcExerciseCalories(name, data, userWeightKg = 70) {
  const ex = getExercise(name);
  if (!ex || !ex.type) return 0;

  switch (ex.type) {
    case "weighted": {
      // Work calories: each rep lifts real weight → proportional burn
      const workCals = (data.sets || []).reduce((sum, s) => {
        const reps = parseInt(s.reps) || 0;
        const kg   = parseFloat(s.weight_kg) || 0;
        return sum + reps * kg * 0.015;
      }, 0);
      // Overhead: time under tension + rest between sets
      const activeSets = (data.sets || []).filter(s => parseInt(s.reps) > 0).length;
      const overheadCals = activeSets * (2.5 / 60) * ex.met * userWeightKg;
      return Math.round(workCals + overheadCals);
    }
    case "bodyweight": {
      const totalReps = (data.sets || [])
        .reduce((a, s) => a + (parseInt(s.reps) || 0), 0);
      return Math.round(totalReps * ex.calsPerRep);
    }
    case "cardio": {
      const durationH = (parseFloat(data.duration_min) || 0) / 60;
      return Math.round(ex.met * userWeightKg * durationH);
    }
    case "timed": {
      const mins = (parseFloat(data.duration_sec) || 0) / 60;
      return Math.round(ex.calsPerMin * mins);
    }
    default: return 0;
  }
}

/**
 * Total calories for a full workout session.
 * @param {Array<{name, data}>} exerciseList
 */
export function calcWorkoutCalories(exerciseList, userWeightKg = 70) {
  return exerciseList.reduce(
    (sum, ex) => sum + calcExerciseCalories(ex.name, ex.data || {}, userWeightKg),
    0
  );
}


// ══════════════════════════════════════════════════════════════
// 6. MEAL & NUTRITION CONFIG
// ══════════════════════════════════════════════════════════════
export const MEAL_TYPES = [
  { value:"breakfast", label:"Breakfast", icon:"☕", color:"#fb923c", time:"6–10 AM"  },
  { value:"lunch",     label:"Lunch",     icon:"🌤️", color:"#22d3ee", time:"12–2 PM" },
  { value:"dinner",    label:"Dinner",    icon:"🌙", color:"#a78bfa", time:"7–9 PM"  },
  { value:"snack",     label:"Snack",     icon:"🍪", color:"#34d399", time:"Any time" },
];

export const getMealMeta = (type) =>
  MEAL_TYPES.find(m => m.value === type) || MEAL_TYPES[3];

/** Quick-add common foods (for future autocomplete feature) */
export const COMMON_FOODS = [
  { name:"Rice (1 cup cooked)",    calories:206, protein_g:4,  carbs_g:45, fat_g:0   },
  { name:"Chicken Breast (100g)",  calories:165, protein_g:31, carbs_g:0,  fat_g:3.6 },
  { name:"Whole Egg",              calories:78,  protein_g:6,  carbs_g:0.6,fat_g:5   },
  { name:"Banana",                 calories:89,  protein_g:1,  carbs_g:23, fat_g:0   },
  { name:"Oats (100g dry)",        calories:389, protein_g:17, carbs_g:66, fat_g:7   },
  { name:"Greek Yogurt (150g)",    calories:130, protein_g:17, carbs_g:9,  fat_g:0   },
  { name:"Brown Rice (1 cup)",     calories:216, protein_g:5,  carbs_g:45, fat_g:1.8 },
  { name:"Salmon (100g)",          calories:208, protein_g:20, carbs_g:0,  fat_g:13  },
  { name:"Almonds (30g)",          calories:173, protein_g:6,  carbs_g:6,  fat_g:15  },
  { name:"Whey Protein (1 scoop)", calories:120, protein_g:25, carbs_g:3,  fat_g:1   },
  { name:"Milk (250ml)",           calories:150, protein_g:8,  carbs_g:12, fat_g:8   },
  { name:"Bread (1 slice)",        calories:80,  protein_g:3,  carbs_g:15, fat_g:1   },
  { name:"Peanut Butter (2 tbsp)", calories:190, protein_g:8,  carbs_g:6,  fat_g:16  },
  { name:"Apple",                  calories:95,  protein_g:0.5,carbs_g:25, fat_g:0   },
  { name:"Sweet Potato (medium)",  calories:103, protein_g:2,  carbs_g:24, fat_g:0   },
];


// ══════════════════════════════════════════════════════════════
// 7. USER BIOMETRIC CONFIG
// ══════════════════════════════════════════════════════════════
export const FITNESS_GOALS = [
  { value:"loss",     label:"🔥 Lose weight", sub:"Caloric deficit (-500 kcal)", offset:-500 },
  { value:"maintain", label:"⚖️ Maintain",     sub:"Balanced calories",           offset:0    },
  { value:"gain",     label:"💪 Gain muscle",  sub:"Caloric surplus (+300 kcal)", offset:+300 },
];

export const GENDERS = [
  { value:"male",   label:"♂ Male"   },
  { value:"female", label:"♀ Female" },
  { value:"other",  label:"⊕ Other"  },
];

/**
 * Mifflin-St Jeor BMR × 1.375 (lightly active) + goal offset.
 * Returns recommended daily caloric intake.
 */
export function calcCaloricGoal(biometrics) {
  const { age, weight_kg, height_cm, gender, fitness_goal } = biometrics;
  const bmr = gender === "male"
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  const tdee   = Math.round(bmr * 1.375);
  const goal   = FITNESS_GOALS.find(g => g.value === fitness_goal);
  return tdee + (goal?.offset ?? 0);
}

/**
 * Returns { bmi, label, color } for display.
 */
export function calcBMI(weight_kg, height_cm) {
  const h   = height_cm / 100;
  const bmi = +(weight_kg / (h * h)).toFixed(1);
  const label = bmi < 18.5 ? "Underweight"
              : bmi < 25   ? "Healthy"
              : bmi < 30   ? "Overweight"
              :               "Obese";
  const color = bmi < 18.5 ? "#22d3ee"
              : bmi < 25   ? "#34d399"
              : bmi < 30   ? "#fb923c"
              :               "#f87171";
  return { bmi, label, color };
}


// ══════════════════════════════════════════════════════════════
// 8. VITALS REFERENCE RANGES
// ══════════════════════════════════════════════════════════════
export const VITAL_RANGES = {
  heartRate: {
    unit:"bpm",
    ranges:[
      { max:59,  status:"warning", label:"Low",      color:"#22d3ee" },
      { max:100, status:"normal",  label:"Normal",   color:"#34d399" },
      { max:130, status:"warning", label:"High",     color:"#fb923c" },
      { max:999, status:"danger",  label:"Very High",color:"#f87171" },
    ],
  },
  bloodSugar: {
    unit:"mmol/L",
    ranges:[
      { max:3.9,  status:"danger",  label:"Low",      color:"#22d3ee" },
      { max:5.6,  status:"normal",  label:"Normal",   color:"#34d399" },
      { max:7.0,  status:"warning", label:"Elevated", color:"#fb923c" },
      { max:999,  status:"danger",  label:"High",     color:"#f87171" },
    ],
  },
  bloodPressureSys: {
    unit:"mmHg",
    ranges:[
      { max:89,  status:"warning", label:"Low",      color:"#22d3ee" },
      { max:120, status:"normal",  label:"Normal",   color:"#34d399" },
      { max:139, status:"warning", label:"Elevated", color:"#fb923c" },
      { max:999, status:"danger",  label:"High",     color:"#f87171" },
    ],
  },
  spo2: {
    unit:"%",
    ranges:[
      { max:94,  status:"danger",  label:"Low",        color:"#f87171" },
      { max:97,  status:"warning", label:"Low Normal", color:"#fb923c" },
      { max:100, status:"normal",  label:"Normal",     color:"#34d399" },
    ],
  },
};

/**
 * Get status label + color for any vital reading.
 * @param {"heartRate"|"bloodSugar"|"bloodPressureSys"|"spo2"} type
 * @param {number|null} value
 */
export function getVitalStatus(type, value) {
  if (value == null) return { status:"unknown", label:"Not logged", color:"#64748b" };
  const config = VITAL_RANGES[type];
  if (!config) return { status:"unknown", label:"—", color:"#64748b" };
  for (const range of config.ranges) {
    if (value <= range.max) return range;
  }
  return { status:"unknown", label:"—", color:"#64748b" };
}


// ══════════════════════════════════════════════════════════════
// 9. HYDRATION CONFIG
// ══════════════════════════════════════════════════════════════
export const WATER_QUICK_ADD = [250, 500]; // ml — one-tap options

export const HYDRATION_LEVELS = [
  { min:0,   max:24,  label:"Dehydrated",    color:"#f87171", emoji:"🔴" },
  { min:25,  max:49,  label:"Low",           color:"#fb923c", emoji:"🟠" },
  { min:50,  max:74,  label:"Getting there", color:"#fbbf24", emoji:"🟡" },
  { min:75,  max:99,  label:"Well hydrated", color:"#34d399", emoji:"🟢" },
  { min:100, max:999, label:"Goal reached!", color:"#22d3ee", emoji:"💧" },
];

export function getHydrationLevel(ml, goalMl = APP.waterGoalMl) {
  const pct = Math.min(Math.round((ml / goalMl) * 100), 100);
  return HYDRATION_LEVELS.find(l => pct >= l.min && pct <= l.max)
    || HYDRATION_LEVELS[0];
}


// ══════════════════════════════════════════════════════════════
// 10. GREETING UTIL
// ══════════════════════════════════════════════════════════════
export function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}


// ══════════════════════════════════════════════════════════════
// 11. FOOD DATABASE
// ══════════════════════════════════════════════════════════════
/**
 * unit: "g"    → quantity is in grams (show slider + input)
 * unit: "pc"   → quantity is pieces/count (roti, egg, etc.)
 * unit: "ml"   → quantity is millilitres (milk, juice, etc.)
 *
 * Nutrition values are PER UNIT (per gram / per piece / per ml).
 * calories, protein_g, carbs_g, fat_g — all per 1 unit.
 *
 * defaultQty: sensible starting quantity for this food.
 */
export const FOOD_DB = [
  // ── GRAINS & RICE ─────────────────────────────────────────
  { name:"Rice (cooked)",        category:"Grains",   unit:"g",  defaultQty:150, per:{ calories:1.30, protein_g:0.027, carbs_g:0.286, fat_g:0.003 } },
  { name:"Brown Rice (cooked)",  category:"Grains",   unit:"g",  defaultQty:150, per:{ calories:1.11, protein_g:0.026, carbs_g:0.230, fat_g:0.009 } },
  { name:"Basmati Rice (cooked)",category:"Grains",   unit:"g",  defaultQty:150, per:{ calories:1.21, protein_g:0.025, carbs_g:0.260, fat_g:0.003 } },
  { name:"Roti / Chapati",       category:"Grains",   unit:"pc", defaultQty:2,   per:{ calories:71,   protein_g:2.7,   carbs_g:14.0,  fat_g:0.4  } },
  { name:"Paratha (plain)",      category:"Grains",   unit:"pc", defaultQty:1,   per:{ calories:260,  protein_g:5.0,   carbs_g:38.0,  fat_g:10.0 } },
  { name:"Naan",                 category:"Grains",   unit:"pc", defaultQty:1,   per:{ calories:262,  protein_g:8.7,   carbs_g:45.0,  fat_g:5.1  } },
  { name:"Bread (white, slice)", category:"Grains",   unit:"pc", defaultQty:2,   per:{ calories:79,   protein_g:2.7,   carbs_g:15.0,  fat_g:1.0  } },
  { name:"Bread (brown, slice)", category:"Grains",   unit:"pc", defaultQty:2,   per:{ calories:72,   protein_g:3.5,   carbs_g:13.0,  fat_g:1.0  } },
  { name:"Oats (dry)",           category:"Grains",   unit:"g",  defaultQty:80,  per:{ calories:3.89, protein_g:0.170, carbs_g:0.660, fat_g:0.070} },
  { name:"Poha (cooked)",        category:"Grains",   unit:"g",  defaultQty:150, per:{ calories:1.10, protein_g:0.020, carbs_g:0.230, fat_g:0.012} },
  { name:"Upma (cooked)",        category:"Grains",   unit:"g",  defaultQty:150, per:{ calories:1.13, protein_g:0.030, carbs_g:0.180, fat_g:0.050} },
  { name:"Idli",                 category:"Grains",   unit:"pc", defaultQty:3,   per:{ calories:39,   protein_g:2.0,   carbs_g:8.0,   fat_g:0.2  } },
  { name:"Dosa (plain)",         category:"Grains",   unit:"pc", defaultQty:1,   per:{ calories:112,  protein_g:2.6,   carbs_g:20.0,  fat_g:2.5  } },
  { name:"Pasta (cooked)",       category:"Grains",   unit:"g",  defaultQty:180, per:{ calories:1.31, protein_g:0.050, carbs_g:0.250, fat_g:0.011} },

  // ── PROTEINS ──────────────────────────────────────────────
  { name:"Chicken Breast",       category:"Protein",  unit:"g",  defaultQty:150, per:{ calories:1.65, protein_g:0.310, carbs_g:0.000, fat_g:0.036} },
  { name:"Chicken Thigh",        category:"Protein",  unit:"g",  defaultQty:120, per:{ calories:2.09, protein_g:0.260, carbs_g:0.000, fat_g:0.130} },
  { name:"Mutton / Lamb",        category:"Protein",  unit:"g",  defaultQty:120, per:{ calories:2.58, protein_g:0.250, carbs_g:0.000, fat_g:0.175} },
  { name:"Fish (tilapia)",       category:"Protein",  unit:"g",  defaultQty:150, per:{ calories:1.28, protein_g:0.262, carbs_g:0.000, fat_g:0.027} },
  { name:"Salmon",               category:"Protein",  unit:"g",  defaultQty:150, per:{ calories:2.08, protein_g:0.200, carbs_g:0.000, fat_g:0.130} },
  { name:"Tuna (canned)",        category:"Protein",  unit:"g",  defaultQty:100, per:{ calories:1.16, protein_g:0.260, carbs_g:0.000, fat_g:0.010} },
  { name:"Egg (whole)",          category:"Protein",  unit:"pc", defaultQty:2,   per:{ calories:78,   protein_g:6.0,   carbs_g:0.6,   fat_g:5.0  } },
  { name:"Egg White",            category:"Protein",  unit:"pc", defaultQty:3,   per:{ calories:17,   protein_g:3.6,   carbs_g:0.2,   fat_g:0.0  } },
  { name:"Paneer",               category:"Protein",  unit:"g",  defaultQty:100, per:{ calories:2.65, protein_g:0.180, carbs_g:0.013, fat_g:0.208} },
  { name:"Tofu",                 category:"Protein",  unit:"g",  defaultQty:150, per:{ calories:0.76, protein_g:0.080, carbs_g:0.019, fat_g:0.046} },
  { name:"Dal (cooked)",         category:"Protein",  unit:"g",  defaultQty:200, per:{ calories:1.16, protein_g:0.090, carbs_g:0.200, fat_g:0.004} },
  { name:"Chole / Chickpeas",    category:"Protein",  unit:"g",  defaultQty:150, per:{ calories:1.64, protein_g:0.089, carbs_g:0.275, fat_g:0.026} },
  { name:"Rajma (cooked)",       category:"Protein",  unit:"g",  defaultQty:150, per:{ calories:1.27, protein_g:0.086, carbs_g:0.226, fat_g:0.005} },
  { name:"Whey Protein (scoop)", category:"Protein",  unit:"pc", defaultQty:1,   per:{ calories:120,  protein_g:25.0,  carbs_g:3.0,   fat_g:1.0  } },

  // ── DAIRY ─────────────────────────────────────────────────
  { name:"Milk (whole)",         category:"Dairy",    unit:"ml", defaultQty:250, per:{ calories:0.61, protein_g:0.032, carbs_g:0.048, fat_g:0.033} },
  { name:"Milk (skimmed)",       category:"Dairy",    unit:"ml", defaultQty:250, per:{ calories:0.35, protein_g:0.036, carbs_g:0.050, fat_g:0.002} },
  { name:"Greek Yogurt",         category:"Dairy",    unit:"g",  defaultQty:150, per:{ calories:0.59, protein_g:0.100, carbs_g:0.036, fat_g:0.003} },
  { name:"Curd / Dahi",          category:"Dairy",    unit:"g",  defaultQty:150, per:{ calories:0.61, protein_g:0.035, carbs_g:0.047, fat_g:0.033} },
  { name:"Cheese (slice)",       category:"Dairy",    unit:"pc", defaultQty:2,   per:{ calories:70,   protein_g:4.5,   carbs_g:1.0,   fat_g:5.5  } },
  { name:"Butter",               category:"Dairy",    unit:"g",  defaultQty:10,  per:{ calories:7.17, protein_g:0.009, carbs_g:0.001, fat_g:0.812} },
  { name:"Ghee",                 category:"Dairy",    unit:"g",  defaultQty:10,  per:{ calories:9.00, protein_g:0.000, carbs_g:0.000, fat_g:1.000} },

  // ── VEGETABLES ────────────────────────────────────────────
  { name:"Broccoli",             category:"Veggie",   unit:"g",  defaultQty:100, per:{ calories:0.34, protein_g:0.028, carbs_g:0.066, fat_g:0.004} },
  { name:"Spinach",              category:"Veggie",   unit:"g",  defaultQty:100, per:{ calories:0.23, protein_g:0.029, carbs_g:0.036, fat_g:0.004} },
  { name:"Potato (boiled)",      category:"Veggie",   unit:"g",  defaultQty:150, per:{ calories:0.87, protein_g:0.020, carbs_g:0.200, fat_g:0.001} },
  { name:"Sweet Potato",         category:"Veggie",   unit:"g",  defaultQty:150, per:{ calories:0.86, protein_g:0.016, carbs_g:0.200, fat_g:0.001} },
  { name:"Carrot",               category:"Veggie",   unit:"g",  defaultQty:100, per:{ calories:0.41, protein_g:0.009, carbs_g:0.096, fat_g:0.002} },
  { name:"Onion",                category:"Veggie",   unit:"g",  defaultQty:50,  per:{ calories:0.40, protein_g:0.011, carbs_g:0.093, fat_g:0.001} },
  { name:"Tomato",               category:"Veggie",   unit:"g",  defaultQty:100, per:{ calories:0.18, protein_g:0.009, carbs_g:0.039, fat_g:0.002} },

  // ── FRUITS ────────────────────────────────────────────────
  { name:"Banana",               category:"Fruit",    unit:"pc", defaultQty:1,   per:{ calories:89,   protein_g:1.1,   carbs_g:23.0,  fat_g:0.3  } },
  { name:"Apple",                category:"Fruit",    unit:"pc", defaultQty:1,   per:{ calories:95,   protein_g:0.5,   carbs_g:25.0,  fat_g:0.3  } },
  { name:"Orange",               category:"Fruit",    unit:"pc", defaultQty:1,   per:{ calories:62,   protein_g:1.2,   carbs_g:15.0,  fat_g:0.2  } },
  { name:"Mango",                category:"Fruit",    unit:"g",  defaultQty:150, per:{ calories:0.60, protein_g:0.008, carbs_g:0.150, fat_g:0.004} },
  { name:"Watermelon",           category:"Fruit",    unit:"g",  defaultQty:200, per:{ calories:0.30, protein_g:0.006, carbs_g:0.076, fat_g:0.002} },

  // ── SNACKS & FAST FOOD ────────────────────────────────────
  { name:"Almonds",              category:"Snacks",   unit:"g",  defaultQty:30,  per:{ calories:5.79, protein_g:0.213, carbs_g:0.216, fat_g:0.499} },
  { name:"Peanuts",              category:"Snacks",   unit:"g",  defaultQty:30,  per:{ calories:5.67, protein_g:0.258, carbs_g:0.160, fat_g:0.490} },
  { name:"Peanut Butter",        category:"Snacks",   unit:"g",  defaultQty:32,  per:{ calories:5.88, protein_g:0.250, carbs_g:0.200, fat_g:0.500} },
  { name:"Samosa",               category:"Snacks",   unit:"pc", defaultQty:2,   per:{ calories:130,  protein_g:3.0,   carbs_g:18.0,  fat_g:5.5  } },
  { name:"Burger (veg)",         category:"Snacks",   unit:"pc", defaultQty:1,   per:{ calories:295,  protein_g:8.0,   carbs_g:45.0,  fat_g:10.0 } },
  { name:"Burger (chicken)",     category:"Snacks",   unit:"pc", defaultQty:1,   per:{ calories:390,  protein_g:20.0,  carbs_g:40.0,  fat_g:16.0 } },
  { name:"Pizza (slice)",        category:"Snacks",   unit:"pc", defaultQty:2,   per:{ calories:285,  protein_g:12.0,  carbs_g:36.0,  fat_g:10.0 } },

  // ── BEVERAGES ─────────────────────────────────────────────
  { name:"Orange Juice",         category:"Drink",    unit:"ml", defaultQty:250, per:{ calories:0.45, protein_g:0.007, carbs_g:0.104, fat_g:0.002} },
  { name:"Coconut Water",        category:"Drink",    unit:"ml", defaultQty:300, per:{ calories:0.19, protein_g:0.007, carbs_g:0.039, fat_g:0.002} },
  { name:"Tea (with milk+sugar)",category:"Drink",    unit:"ml", defaultQty:200, per:{ calories:0.30, protein_g:0.005, carbs_g:0.055, fat_g:0.010} },
  { name:"Coffee (black)",       category:"Drink",    unit:"ml", defaultQty:200, per:{ calories:0.02, protein_g:0.003, carbs_g:0.000, fat_g:0.000} },
];

/** Lookup food entry by name */
export const getFood = (name) => FOOD_DB.find(f => f.name === name) || null;

/** Get all unique categories */
export const FOOD_CATEGORIES = [...new Set(FOOD_DB.map(f => f.category))];

/**
 * Calculate nutrition for a given food + quantity.
 * Returns { calories, protein_g, carbs_g, fat_g } all rounded.
 */
export function calcFoodNutrition(foodName, quantity) {
  const food = getFood(foodName);
  if (!food || !quantity) return { calories:0, protein_g:0, carbs_g:0, fat_g:0 };
  const q = parseFloat(quantity) || 0;
  return {
    calories:  Math.round(food.per.calories  * q * 10) / 10,
    protein_g: Math.round(food.per.protein_g * q * 10) / 10,
    carbs_g:   Math.round(food.per.carbs_g   * q * 10) / 10,
    fat_g:     Math.round(food.per.fat_g     * q * 10) / 10,
  };
}