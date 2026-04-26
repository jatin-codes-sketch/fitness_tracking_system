/**
 * VitalityHub — Log Page
 * Smart food selector: choose food → set quantity → nutrition auto-calculates.
 */
import { useState, useMemo, useCallback } from "react";
import { Activity, Dumbbell, Utensils, Plus, Trash2, CheckCircle, ChevronDown, Search, X } from "lucide-react";
import { useLogVitals, useLogWorkout } from "@/hooks/useData.js";
import { nutritionAPI } from "@/api/client.js";
import { PageHeader, FormField, ErrorBanner } from "@/components/Spinner.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import {
  EXERCISES, EXERCISE_TYPES, getExercise, getGroupedExercises,
  calcExerciseCalories, calcWorkoutCalories,
  MEAL_TYPES, FOOD_DB, FOOD_CATEGORIES, getFood, calcFoodNutrition,
} from "@/constants/index.js";

// Smart default weight suggestions per exercise (kg)
const DEFAULT_WEIGHTS = {
  "Deadlift": 100, "Sumo Deadlift": 100, "Romanian Deadlift": 80,
  "Squat": 80, "Front Squat": 70, "Hack Squat": 70, "Leg Press": 120,
  "Bench Press": 60, "Incline Bench Press": 50, "Decline Press": 55,
  "Chest Dip (Weighted)": 20, "Cable Fly": 15, "Pec Deck Machine": 40,
  "Overhead Press": 50, "Arnold Press": 20,
  "Barbell Row": 60, "T-Bar Row": 50, "Lat Pulldown": 50,
  "Seated Cable Row": 45, "Single Arm Row": 25,
  "Bicep Curl": 15, "Hammer Curl": 15, "Preacher Curl": 12,
  "Tricep Pushdown": 25, "Skull Crusher": 30, "Close Grip Bench": 50,
  "Lateral Raise": 10, "Front Raise": 10, "Rear Delt Fly": 8,
  "Leg Curl": 40, "Leg Extension": 40, "Calf Raise": 50,
  "Cable Crunch": 30, "Weighted Sit Up": 10, "Ab Wheel Rollout": 0,
};
const getDefaultWeight = (name) => DEFAULT_WEIGHTS[name] ?? 20;

// ══════════════════════════════════════════════════════════════
// FOOD SELECTOR DROPDOWN
// ══════════════════════════════════════════════════════════════
function FoodSelector({ value, onChange }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const [cat,    setCat]    = useState("All");

  const filtered = useMemo(() => {
    return FOOD_DB.filter(f => {
      const matchCat    = cat === "All" || f.category === cat;
      const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, cat]);

  const selectedFood = getFood(value);

  return (
    <div style={{ position:"relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:"100%", padding:"11px 14px",
          background:"var(--input-bg)", boxShadow:"var(--neu-inset)",
          border:`1px solid ${open ? "#22d3ee66" : "var(--vh-border)"}`,
          borderRadius:12, cursor:"pointer", fontFamily:"inherit",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          color:"var(--vh-text)", fontSize:14, transition:"border-color .2s",
        }}
      >
        <span>
          {selectedFood ? (
            <span style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, background:"#22d3ee22", color:"#22d3ee", borderRadius:99, padding:"2px 8px", fontWeight:700 }}>
                {selectedFood.category}
              </span>
              {selectedFood.name}
            </span>
          ) : (
            <span style={{ color:"var(--vh-muted)" }}>Search or select food…</span>
          )}
        </span>
        <ChevronDown size={14} color="var(--vh-muted)"
          style={{ transform:open?"rotate(180deg)":"none", transition:"transform .2s", flexShrink:0 }}/>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:100,
          background:"var(--vh-surface)", boxShadow:"var(--neu-raised)",
          borderRadius:14, border:"1px solid var(--vh-border)",
          overflow:"hidden",
        }}>
          {/* Search bar */}
          <div style={{ padding:"10px 12px", borderBottom:"1px solid var(--vh-border)33", display:"flex", alignItems:"center", gap:8 }}>
            <Search size={14} color="var(--vh-muted)"/>
            <input
              autoFocus
              placeholder="Search food…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex:1, background:"none", border:"none", outline:"none",
                color:"var(--vh-text)", fontSize:13, fontFamily:"inherit",
              }}
            />
          </div>

          {/* Category pills */}
          <div style={{ display:"flex", gap:6, padding:"8px 12px", overflowX:"auto", borderBottom:"1px solid var(--vh-border)33" }}>
            {["All", ...FOOD_CATEGORIES].map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding:"4px 10px", borderRadius:99, border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:11, fontWeight:cat===c?700:400, flexShrink:0,
                background: cat===c ? "#22d3ee" : "var(--vh-depressed)",
                color:       cat===c ? "#0f172a" : "var(--vh-muted)",
              }}>{c}</button>
            ))}
          </div>

          {/* Food list */}
          <div style={{ maxHeight:220, overflowY:"auto" }}>
            {filtered.length === 0 ? (
              <p style={{ padding:"16px", textAlign:"center", color:"var(--vh-muted)", fontSize:13 }}>
                No foods found. Try a different search.
              </p>
            ) : filtered.map(food => (
              <button key={food.name} onClick={() => { onChange(food.name); setOpen(false); setSearch(""); }} style={{
                width:"100%", padding:"10px 14px",
                background: value===food.name ? "#22d3ee11" : "none",
                border:"none", cursor:"pointer", fontFamily:"inherit",
                textAlign:"left", borderBottom:"1px solid var(--vh-border)22",
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <span style={{ fontSize:13, color: value===food.name ? "#22d3ee" : "var(--vh-text)", fontWeight: value===food.name ? 700 : 400 }}>
                  {food.name}
                </span>
                <span style={{ fontSize:10, color:"var(--vh-muted)", marginLeft:8, flexShrink:0 }}>
                  {food.unit === "g"  ? `per 100g`              : ""}
                  {food.unit === "ml" ? `per 100ml`             : ""}
                  {food.unit === "pc" ? `${Math.round(food.per.calories)} kcal/pc` : ""}
                  {food.unit === "g"  ? ` · ${Math.round(food.per.calories * 100)} kcal` : ""}
                  {food.unit === "ml" ? ` · ${Math.round(food.per.calories * 100)} kcal` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// QUANTITY INPUT — changes label based on food unit
// ══════════════════════════════════════════════════════════════
function QuantityInput({ food, quantity, onChange }) {
  if (!food) return null;

  const unitLabel = food.unit === "g"  ? "grams"
                  : food.unit === "ml" ? "ml"
                  : food.unit === "pc" ? (food.name.includes("Roti") || food.name.includes("Chapati") || food.name.includes("Idli") || food.name.includes("Egg") ? "pieces" : "servings")
                  : "qty";

  const step = food.unit === "g" || food.unit === "ml" ? 10 : 1;
  const max  = food.unit === "g" || food.unit === "ml" ? 1000 : 20;

  // Calculate percentage of max to shift color
  const pct = Math.min((quantity / max) * 100, 100);
  
  // Morphing color: from bright red to deep gym red
  const morphColor = `color-mix(in srgb, #b91c1c ${pct}%, #f87171)`;

  return (
    <div style={{ marginTop:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <label style={{ fontSize:11, color:"var(--vh-muted)", fontWeight:600 }}>
          Quantity ({unitLabel})
        </label>
        <span style={{ fontSize:11, color:morphColor, fontWeight:700, transition:"color 0.3s" }}>
          {quantity} {unitLabel}
        </span>
      </div>

      {/* Slider */}
      <div style={{ position: "relative", padding: "6px 0", marginBottom: 8 }}>
        <input
          type="range"
          min={food.unit === "pc" ? 1 : 10}
          max={max}
          step={step}
          value={quantity}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ 
            width:"100%", 
            accentColor:morphColor, 
            height: food.unit === "g" ? 8 : 4,
            background: food.unit === "ml" 
              ? "repeating-linear-gradient(45deg, var(--vh-border), var(--vh-border) 4px, var(--vh-depressed) 4px, var(--vh-depressed) 8px)" 
              : "var(--vh-depressed)",
            borderRadius: 4,
            outline: "none",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
        />
      </div>

      {/* Quick-set buttons */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {(food.unit === "g"  ? [50, 100, 150, 200, 250] :
          food.unit === "ml" ? [100, 200, 250, 300, 500] :
          [1, 2, 3, 4, 5]).map(v => (
          <button key={v} onClick={() => onChange(v)} style={{
            padding:"4px 10px", borderRadius:99, border:"none", cursor:"pointer",
            fontFamily:"inherit", fontSize:11, fontWeight:quantity===v?700:400,
            background: quantity===v ? morphColor : "var(--vh-depressed)",
            color:       quantity===v ? "#ffffff" : "var(--vh-muted)",
            boxShadow:   quantity===v ? `0 2px 8px ${morphColor}66` : "var(--neu-inset)",
            transition: "all 0.2s"
          }}>
            {v}{food.unit === "pc" ? "" : food.unit}
          </button>
        ))}
        {/* Manual input */}
        <input
          type="number"
          value={quantity}
          min={1}
          max={max}
          onChange={e => onChange(parseFloat(e.target.value) || food.defaultQty)}
          style={{
            width:60, padding:"4px 8px", borderRadius:8,
            background:"var(--input-bg)", border:`1px solid ${morphColor}44`,
            boxShadow:"var(--neu-inset)", color:"var(--vh-text)",
            fontSize:11, fontFamily:"inherit", outline:"none", textAlign:"center",
          }}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// GHOST-FILL NUTRITION PREVIEW CARD
// ══════════════════════════════════════════════════════════════
function NutritionPreview({ nutrition, foodName }) {
  if (!nutrition || nutrition.calories === 0) return null;
  
  // Assuming a standard 2000 kcal daily diet for the ghost projection
  const GOALS = { calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65 };

  return (
    <div style={{
      background:"var(--vh-surface)", boxShadow:"var(--neu-raised)",
      borderRadius:12, padding:"12px 14px", marginTop:10,
      display:"flex", gap:6, flexWrap:"wrap",
    }}>
      {[
        { label:"Calories",  value:`${nutrition.calories}`,     num: nutrition.calories,  goal: GOALS.calories,  unit:"kcal", color:"var(--gym-accent)" },
        { label:"Protein",   value:`${nutrition.protein_g}`,    num: nutrition.protein_g, goal: GOALS.protein_g, unit:"g",    color:"#a78bfa" },
        { label:"Carbs",     value:`${nutrition.carbs_g}`,      num: nutrition.carbs_g,   goal: GOALS.carbs_g,   unit:"g",    color:"#34d399" },
        { label:"Fat",       value:`${nutrition.fat_g}`,        num: nutrition.fat_g,     goal: GOALS.fat_g,     unit:"g",    color:"#fb923c" },
      ].map(({ label, value, num, goal, unit, color }) => {
        const pct = Math.min((num / goal) * 100, 100);
        return (
          <div key={label} title={`${Math.round(pct)}% of daily ${label}`} style={{ 
            flex:"1 1 calc(25% - 6px)", textAlign:"center", padding:"8px 0",
            position: "relative", overflow: "hidden", borderRadius: 8,
            border: "1px solid var(--vh-border)"
          }}>
            {/* Ghost Fill */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, top: 0,
              width: `${pct}%`, background: `${color}22`,
              transition: "width 0.3s ease-out", zIndex: 0
            }} />
            
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ fontSize:9, color:"var(--vh-muted)", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:0.5 }}>{label}</p>
              <p style={{ margin:0, fontWeight:700, color, fontSize:16, transition:"color 0.3s" }}>
                {value}<span style={{ fontSize:10, fontWeight:400, marginLeft:1 }}>{unit}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MEAL FOOD ITEM (one item in the meal)
// ══════════════════════════════════════════════════════════════
function MealItem({ index, item, onChange, onRemove, showRemove }) {
  const food       = getFood(item.foodName);
  const nutrition  = useMemo(() => calcFoodNutrition(item.foodName, item.quantity), [item.foodName, item.quantity]);

  const handleFoodChange = useCallback((name) => {
    const f = getFood(name);
    onChange({ foodName: name, quantity: f?.defaultQty || 100 });
  }, [onChange]);

  const handleQtyChange = useCallback((qty) => {
    onChange({ ...item, quantity: qty });
  }, [item, onChange]);

  return (
    <div className="uiverse-card" style={{
      padding:14, marginBottom:12,
    }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:12, fontWeight:700, color:"var(--vh-muted)" }}>
          Item {index + 1}
        </span>
        {showRemove && (
          <button onClick={onRemove} style={{
            background:"#f8717122", border:"none", borderRadius:8,
            padding:"4px 10px", cursor:"pointer", color:"#f87171",
          }}>
            <Trash2 size={13}/>
          </button>
        )}
      </div>

      {/* Food selector */}
      <FoodSelector value={item.foodName} onChange={handleFoodChange}/>

      {/* Quantity slider + quick-set */}
      {food && (
        <QuantityInput food={food} quantity={item.quantity} onChange={handleQtyChange}/>
      )}

      {/* Auto-calculated nutrition */}
      <NutritionPreview nutrition={nutrition} foodName={item.foodName}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MEAL FORM
// ══════════════════════════════════════════════════════════════
const emptyItem = () => ({ foodName:"", quantity:100 });

function MealForm() {
  const [mealType, setMealType] = useState("breakfast");
  const [items,    setItems]    = useState([emptyItem()]);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState(null);

  const updateItem = useCallback((i, data) => {
    setItems(p => p.map((it, idx) => idx !== i ? it : { ...it, ...data }));
  }, []);

  const removeItem = useCallback((i) => {
    setItems(p => p.filter((_, idx) => idx !== i));
  }, []);

  // Running totals across all items
  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
      const n = calcFoodNutrition(item.foodName, item.quantity);
      return {
        calories:  +(acc.calories  + n.calories ).toFixed(1),
        protein_g: +(acc.protein_g + n.protein_g).toFixed(1),
        carbs_g:   +(acc.carbs_g   + n.carbs_g  ).toFixed(1),
        fat_g:     +(acc.fat_g     + n.fat_g    ).toFixed(1),
      };
    }, { calories:0, protein_g:0, carbs_g:0, fat_g:0 });
  }, [items]);

  const handleSubmit = async () => {
    const valid = items.filter(it => it.foodName);
    if (!valid.length) return setError("Add at least one food item.");
    setLoading(true); setError(null);
    try {
      for (const item of valid) {
        const n = calcFoodNutrition(item.foodName, item.quantity);
        await nutritionAPI.logMeal({
          meal_type: mealType,
          name:      `${item.foodName} (${item.quantity}${getFood(item.foodName)?.unit || ""})`,
          calories:  n.calories,
          protein_g: n.protein_g,
          carbs_g:   n.carbs_g,
          fat_g:     n.fat_g,
        });
      }
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.detail ?? "Failed to log meal.");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="success-ripple-container" style={{ textAlign:"center", padding:"60px 0", position: "relative", overflow: "hidden", borderRadius: 24, background: "var(--vh-surface)" }}>
      <div className="ripple-wave" />
      <div style={{ position: "relative", zIndex: 2, animation: "pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}>
        <CheckCircle size={56} color="var(--gym-accent)" style={{ margin:"0 auto 16px", display:"block", filter: "drop-shadow(0 4px 12px rgba(239,68,68,0.4))" }}/>
        <p style={{ fontWeight:900, fontSize:20, color:"var(--vh-text)", letterSpacing: -0.5 }}>Meal logged!</p>
        <p style={{ color:"var(--vh-muted)", fontSize:13, marginTop: 4 }}>
          {items.filter(it=>it.foodName).length} items · <span style={{ color:"var(--gym-accent)", fontWeight: 700 }}>{totals.calories} kcal</span> total
        </p>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>

      {/* Meal type selector (Pill Track) */}
      <div style={{ 
        display:"flex", position: "relative", marginBottom:16, 
        background: "var(--vh-depressed)", borderRadius: 16, padding: 4,
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
      }}>
        {/* Sliding Indicator */}
        <div style={{
          position: "absolute", top: 4, bottom: 4, left: 4,
          width: `calc((100% - 8px) / ${MEAL_TYPES.length})`,
          background: "var(--vh-surface)",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          border: "1px solid var(--vh-border)",
          transform: `translateX(${MEAL_TYPES.findIndex(m => m.value === mealType) * 100}%)`,
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 0
        }} />

        {MEAL_TYPES.map(({ value, label, icon }) => {
          const active = mealType === value;
          return (
            <button key={value} onClick={() => setMealType(value)} style={{
              flex:1, padding:"10px 4px", border:"none", background:"none",
              cursor:"pointer", fontFamily:"inherit", fontSize:11,
              fontWeight: active ? 700 : 500,
              color: active ? "var(--gym-accent)" : "var(--vh-muted)",
              transition:"color .3s",
              position: "relative", zIndex: 1,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4
            }}>
              <div style={{ fontSize:16, transition: "transform 0.2s", transform: active ? "scale(1.1)" : "scale(1)" }}>{icon}</div>
              <div>{label}</div>
            </button>
          );
        })}
      </div>

      {/* Food items */}
      {items.map((item, i) => (
        <MealItem
          key={i}
          index={i}
          item={item}
          onChange={data => updateItem(i, data)}
          onRemove={() => removeItem(i)}
          showRemove={items.length > 1}
        />
      ))}

      {/* Add item button */}
      <button onClick={() => setItems(p => [...p, emptyItem()])} style={{
        background:"none", border:"1px dashed #22d3ee44", borderRadius:12,
        width:"100%", padding:"11px", color:"#22d3ee", fontSize:13,
        cursor:"pointer", fontFamily:"inherit", marginBottom:14,
        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
      }}>
        <Plus size={14}/> Add another food
      </button>

      {/* Running totals */}
      {totals.calories > 0 && (
        <div className="uiverse-card" style={{
          padding:"14px 16px", marginBottom:14,
        }}>
          <p style={{ fontSize:11, fontWeight:700, color:"var(--vh-muted)", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:1 }}>
            Meal Total
          </p>
          <div style={{ display:"flex", gap:0, flexWrap:"wrap" }}>
            {[
              { label:"Calories",  value:totals.calories,  unit:"kcal", color:"#22d3ee" },
              { label:"Protein",   value:totals.protein_g, unit:"g",    color:"#a78bfa" },
              { label:"Carbs",     value:totals.carbs_g,   unit:"g",    color:"#34d399" },
              { label:"Fat",       value:totals.fat_g,     unit:"g",    color:"#fb923c" },
            ].map(({ label, value, unit, color }) => (
              <div key={label} style={{ flex:"1 1 25%", textAlign:"center" }}>
                <p style={{ fontSize:9, color:"var(--vh-muted)", margin:"0 0 2px", textTransform:"uppercase" }}>{label}</p>
                <p style={{ margin:0, fontWeight:700, color, fontSize:18 }}>
                  {value}<span style={{ fontSize:10, fontWeight:400 }}>{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="vh-btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving…" : `Log Meal (${items.filter(it=>it.foodName).length} item${items.filter(it=>it.foodName).length!==1?"s":""})`}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EXERCISE SELECTOR
// ══════════════════════════════════════════════════════════════
function ExerciseSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => getGroupedExercises(), []);
  const selected = getExercise(value);
  const typeColor = selected?.type ? EXERCISE_TYPES[selected.type]?.color : "#64748b";

  return (
    <div style={{ position:"relative", marginBottom:14, zIndex: open ? 100 : 1 }}>
      <label style={{ fontSize:11, color:"var(--vh-muted)", fontWeight:600, display:"block", marginBottom:6 }}>
        Exercise
      </label>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", padding:"11px 14px",
        background:"var(--input-bg)", boxShadow:"var(--neu-inset)",
        border:`1px solid ${open ? "var(--gym-accent)" : "var(--vh-border)"}`,
        borderRadius:12, cursor:"pointer", fontFamily:"inherit",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        color:"var(--vh-text)", fontSize:14, transition:"border-color .2s",
      }}>
        <span style={{ display:"flex", alignItems:"center", gap:8 }}>
          {selected?.type && (
            <span style={{ fontSize:10, borderRadius:99, padding:"2px 8px", fontWeight:700, background:`${typeColor}22`, color:typeColor }}>
              {EXERCISE_TYPES[selected.type]?.label}
            </span>
          )}
          {value || "Select exercise…"}
        </span>
        <ChevronDown size={14} color="var(--vh-muted)" style={{ transform:open?"rotate(180deg)":"none", transition:"transform .2s" }}/>
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:9999,
          background:"var(--vh-surface)", boxShadow:"0 16px 40px rgba(0,0,0,0.5)",
          borderRadius:14, border:"1px solid var(--vh-border)", maxHeight:320, overflowY:"auto",
        }}>
          {Object.entries(grouped).map(([typeKey, muscleGroups]) => (
            <div key={typeKey}>
              {typeKey !== "custom" && (
                <div style={{ padding:"8px 14px 4px", fontSize:10, fontWeight:700, color:EXERCISE_TYPES[typeKey]?.color, letterSpacing:1, textTransform:"uppercase" }}>
                  {EXERCISE_TYPES[typeKey]?.label}
                </div>
              )}
              {Object.entries(muscleGroups).map(([group, exs]) => (
                <div key={group}>
                  {typeKey !== "custom" && (
                    <div style={{ padding:"4px 14px 2px", fontSize:9, color:"var(--vh-muted)", textTransform:"uppercase", letterSpacing:0.8 }}>{group}</div>
                  )}
                  {exs.map(ex => (
                    <button key={ex.name} onClick={() => { onChange(ex.name); setOpen(false); }} style={{
                      width:"100%", padding:"9px 14px 9px 22px",
                      background: value===ex.name ? "rgba(239,68,68,0.1)" : "none",
                      border:"none", cursor:"pointer",
                      fontFamily:"inherit", textAlign:"left", fontSize:13,
                      color: value===ex.name ? "var(--gym-accent)" : "var(--vh-text)",
                      fontWeight: value===ex.name ? 700 : 400,
                      borderBottom:"1px solid var(--vh-border)",
                      transition: "background 0.15s",
                    }}>{ex.name}</button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EXERCISE FIELDS (smart by type)
// ══════════════════════════════════════════════════════════════
function EnergyDial({ cals }) {
  const clampedCals = Math.min(Math.max(cals, 0), 1000);
  const pct = clampedCals / 1000;
  const rotation = -90 + (pct * 180);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background:"var(--vh-surface)", border:"1px solid var(--vh-border)", borderRadius:12, padding:"8px 14px", display:"inline-flex", boxShadow:"var(--neu-raised)" }}>
      {/* SVG Dial Gauge */}
      <div style={{ position: "relative", width: 32, height: 16, overflow: "hidden" }}>
        <svg viewBox="0 0 100 50" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--vh-depressed)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gymGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="125" strokeDashoffset={125 - (125 * pct)} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
          <g style={{ transform: `translate(50px, 50px) rotate(${rotation}deg)`, transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
            <line x1="0" y1="0" x2="0" y2="-35" stroke="var(--vh-text)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="4" fill="var(--vh-text)" />
          </g>
          <defs>
            <linearGradient id="gymGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="var(--gym-accent)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <span style={{ fontSize:10, color:"var(--vh-muted)", fontWeight:600, display:"block", textTransform:"uppercase", letterSpacing:0.5 }}>Burn Rate</span>
        <span style={{ fontSize:14, color:"var(--gym-accent)", fontWeight:800 }}>{cals} kcal</span>
      </div>
    </div>
  );
}

function ExerciseFields({ exName, data, onChange, userWeightKg }) {
  const ex   = getExercise(exName);
  const cals = calcExerciseCalories(exName, data, userWeightKg);

  const addSet = () => {
    const lastWeight = data.sets?.slice(-1)[0]?.weight_kg || getDefaultWeight(exName);
    onChange({ ...data, sets:[...(data.sets||[]), { set_number:(data.sets?.length||0)+1, reps:"", weight_kg:lastWeight }] });
  };
  const setField = (i, k, v) => onChange({ ...data, sets:data.sets.map((s, idx) => idx!==i?s:{ ...s, [k]:v }) });
  const removeSet = (i) => onChange({ ...data, sets:data.sets.filter((_,idx) => idx!==i).map((s,j) => ({...s, set_number:j+1})) });

  if (!ex?.type) return (
    <div style={{ marginBottom:10 }}>
      <label style={{ fontSize:11, color:"var(--vh-muted)", fontWeight:600, display:"block", marginBottom:5 }}>Notes</label>
      <input className="vh-input" placeholder="Describe the exercise…" value={data.notes||""} onChange={e => onChange({ ...data, notes:e.target.value })}/>
    </div>
  );

  if (ex.type === "cardio") return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", gap:10, marginBottom:8 }}>
        <div style={{ flex:1 }}>
          <label style={{ fontSize:10, color:"var(--vh-muted)", fontWeight:600, display:"block", marginBottom:4 }}>Distance (km)</label>
          <input className="vh-input" type="number" placeholder="5.0" value={data.distance_km||""} onChange={e => onChange({ ...data, distance_km:e.target.value })} style={{ padding:"9px 10px" }}/>
        </div>
        <div style={{ flex:1 }}>
          <label style={{ fontSize:10, color:"var(--vh-muted)", fontWeight:600, display:"block", marginBottom:4 }}>Duration (min)</label>
          <input className="vh-input" type="number" placeholder="30" value={data.duration_min||""} onChange={e => onChange({ ...data, duration_min:e.target.value })} style={{ padding:"9px 10px" }}/>
        </div>
      </div>
      {cals > 0 && <EnergyDial cals={cals}/>}
    </div>
  );

  if (ex.type === "timed") return (
    <div style={{ marginBottom:10 }}>
      <label style={{ fontSize:10, color:"var(--vh-muted)", fontWeight:600, display:"block", marginBottom:4 }}>Duration (seconds)</label>
      <input className="vh-input" type="number" placeholder="60" value={data.duration_sec||""} onChange={e => onChange({ ...data, duration_sec:e.target.value })}/>
      {cals > 0 && <EnergyDial cals={cals}/>}
    </div>
  );

  // Weighted / bodyweight: show set table
  const suggestedWeight = getDefaultWeight(exName);
  return (
    <div style={{ marginBottom:10 }}>
      {/* Column headers */}
      <div style={{ display:"flex", gap:8, marginBottom:6, alignItems:"center" }}>
        <span style={{ fontSize:10, color:"var(--vh-muted)", fontWeight:700, minWidth:28, textTransform:"uppercase", letterSpacing:0.5 }}>Set</span>
        <span style={{ fontSize:10, color:"var(--vh-muted)", fontWeight:700, flex:1, textTransform:"uppercase", letterSpacing:0.5 }}>Reps</span>
        {ex.type === "weighted" && <span style={{ fontSize:10, color:"var(--vh-muted)", fontWeight:700, flex:1, textTransform:"uppercase", letterSpacing:0.5 }}>Weight (kg)</span>}
        <span style={{ width:28 }}></span>
      </div>

      {(data.sets||[]).map((s, i) => (
        <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
          {/* Set badge */}
          <div style={{
            minWidth:28, height:28, borderRadius:8, fontSize:11, fontWeight:800,
            background:"var(--gym-accent)", color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0
          }}>{s.set_number}</div>

          {/* Reps */}
          <input
            className="vh-input" type="number" placeholder="12"
            value={s.reps}
            onChange={e => setField(i,"reps",e.target.value)}
            style={{ flex:1, padding:"8px 10px", textAlign:"center", fontWeight:700 }}
          />

          {/* Weight */}
          {ex.type === "weighted" && (
            <div style={{ flex:1, position:"relative" }}>
              <input
                className="vh-input" type="number"
                placeholder={suggestedWeight}
                value={s.weight_kg}
                onChange={e => setField(i,"weight_kg",e.target.value)}
                style={{ width:"100%", padding:"8px 32px 8px 10px", textAlign:"center", fontWeight:700 }}
              />
              <span style={{
                position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
                fontSize:10, color:"var(--vh-muted)", fontWeight:600, pointerEvents:"none"
              }}>kg</span>
            </div>
          )}

          {/* Delete set */}
          <button
            onClick={() => removeSet(i)}
            disabled={(data.sets||[]).length <= 1}
            style={{
              width:28, height:28, borderRadius:8, border:"none",
              background: (data.sets||[]).length > 1 ? "#f8717122" : "transparent",
              color: (data.sets||[]).length > 1 ? "#f87171" : "var(--vh-border)",
              cursor: (data.sets||[]).length > 1 ? "pointer" : "default",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, padding:0,
            }}
          >
            <X size={12}/>
          </button>
        </div>
      ))}

      <button onClick={addSet} style={{
        background:"none", border:"1px dashed var(--vh-border)", borderRadius:10,
        width:"100%", padding:"7px", color:"var(--vh-muted)", fontSize:12,
        cursor:"pointer", fontFamily:"inherit", marginBottom:8
      }}>
        + Add set
      </button>
      {cals > 0 && <EnergyDial cals={cals}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// VITALS FORM
// ══════════════════════════════════════════════════════════════
function VitalsForm() {
  const { submit, isLoading, error, success } = useLogVitals();
  const [f, setF] = useState({ heart_rate:"", blood_pressure_sys:"", blood_pressure_dia:"", blood_sugar:"", spo2:"" });
  const set = k => e => setF(p => ({ ...p, [k]:e.target.value }));

  if (success) return (
    <div style={{ textAlign:"center", padding:"40px 0" }}>
      <CheckCircle size={48} color="#34d399" style={{ margin:"0 auto 12px", display:"block" }}/>
      <p style={{ fontWeight:700, fontSize:16, color:"var(--vh-text)" }}>Vitals logged!</p>
    </div>
  );

  return (
    <div className="page-enter">
      <ErrorBanner message={error}/>
      {[
        { key:"heart_rate",         label:"Heart Rate (bpm)",    placeholder:"72"  },
        { key:"blood_pressure_sys", label:"Systolic BP (mmHg)",  placeholder:"120" },
        { key:"blood_pressure_dia", label:"Diastolic BP (mmHg)", placeholder:"80"  },
        { key:"blood_sugar",        label:"Blood Sugar (mmol/L)",placeholder:"5.0" },
        { key:"spo2",               label:"SpO₂ (%)",            placeholder:"98"  },
      ].map(({ key, label, placeholder }) => (
        <FormField key={key} label={label}>
          <input className="vh-input" type="number" placeholder={placeholder} value={f[key]} onChange={set(key)}/>
        </FormField>
      ))}
      <button className="vh-btn-primary" onClick={() => {
        const body = {};
        if (f.heart_rate)         body.heart_rate          = parseInt(f.heart_rate);
        if (f.blood_pressure_sys) body.blood_pressure_sys  = parseInt(f.blood_pressure_sys);
        if (f.blood_pressure_dia) body.blood_pressure_dia  = parseInt(f.blood_pressure_dia);
        if (f.blood_sugar)        body.blood_sugar         = parseFloat(f.blood_sugar);
        if (f.spo2)               body.spo2                = parseFloat(f.spo2);
        submit(body);
      }} disabled={isLoading} style={{ marginTop:4 }}>
        {isLoading ? "Saving…" : "Log Vitals"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// WORKOUT FORM
// ══════════════════════════════════════════════════════════════
const newEx = () => ({ name:"", data:{ sets:[{ set_number:1, reps:"", weight_kg:"" }] } });

function WorkoutForm() {
  const { submit, isLoading, error, result } = useLogWorkout();
  const { user } = useAuth();
  const weightKg = user?.biometrics?.weight_kg || 70;

  const [name, setName] = useState("");
  const [dur,  setDur]  = useState("");
  const [exs,  setExs]  = useState([newEx()]);

  const totalCals = useMemo(() => calcWorkoutCalories(exs, weightKg), [exs, weightKg]);

  const setExName = (i, n) => {
    const ex = getExercise(n);
    const defWeight = getDefaultWeight(n);
    const defaultData = ex?.type === "cardio" ? { distance_km:"", duration_min:"" }
                      : ex?.type === "timed"  ? { duration_sec:"" }
                      : { sets:[{ set_number:1, reps:"", weight_kg: ex?.type === "weighted" ? defWeight : "" }] };
    setExs(p => p.map((e, idx) => idx!==i ? e : { name:n, data:defaultData }));
  };
  const setExData = (i, d) => setExs(p => p.map((e, idx) => idx!==i ? e : { ...e, data:d }));

  if (result) return (
    <div className="success-ripple-container" style={{ textAlign:"center", padding:"60px 0", position: "relative", overflow: "hidden", borderRadius: 24, background: "var(--vh-surface)" }}>
      <div className="ripple-wave" />
      <div style={{ position: "relative", zIndex: 2, animation: "pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}>
        <CheckCircle size={56} color="var(--gym-accent)" style={{ margin:"0 auto 16px", display:"block", filter: "drop-shadow(0 4px 12px rgba(239,68,68,0.4))" }}/>
        <p style={{ fontWeight:900, fontSize:20, color:"var(--vh-text)", letterSpacing: -0.5 }}>Workout logged!</p>
        <p style={{ color:"var(--vh-muted)", fontSize:13, marginTop: 4 }}>
          {result.total_volume_kg} kg · {result.total_sets} sets · <span style={{ color:"var(--gym-accent)", fontWeight: 700 }}>{totalCals} kcal</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <ErrorBanner message={error}/>
      <div style={{ display:"flex", gap:10, marginBottom:14 }}>
        <FormField label="Session name" style={{ flex:2 }}>
          <input className="vh-input" placeholder="e.g. Upper Push Day" value={name} onChange={e => setName(e.target.value)}/>
        </FormField>
        <FormField label="Duration (min)" style={{ flex:1 }}>
          <input className="vh-input" type="number" placeholder="45" value={dur} onChange={e => setDur(e.target.value)}/>
        </FormField>
      </div>

      {totalCals > 0 && (
        <div style={{ background:"#fb923c18", border:"1px solid #fb923c44", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:14, color:"#fb923c", fontWeight:700, display:"flex", alignItems:"center", gap:10 }}>
          🔥 Total estimated burn: <span style={{ fontSize:22 }}>{totalCals} kcal</span>
        </div>
      )}

      {exs.map((ex, i) => {
        const exInfo = getExercise(ex.name);
        const tc     = EXERCISE_TYPES[exInfo?.type];
        return (
          <div key={i} className="uiverse-card" style={{ padding:14, marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              {tc && <span style={{ fontSize:10, fontWeight:700, borderRadius:99, padding:"2px 8px", background:`${tc.color}22`, color:tc.color }}>{tc.label}</span>}
              {exs.length > 1 && (
                <button onClick={() => setExs(p => p.filter((_, idx) => idx!==i))} style={{ background:"#f8717122", border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", color:"#f87171", marginLeft:"auto" }}>
                  <Trash2 size={13}/>
                </button>
              )}
            </div>
            <ExerciseSelector value={ex.name} onChange={n => setExName(i, n)}/>
            {ex.name === "Custom" && (
              <FormField label="Custom exercise name">
                <input className="vh-input" placeholder="Enter exercise name…" value={ex.data.customName||""} onChange={e => setExData(i, { ...ex.data, customName:e.target.value })}/>
              </FormField>
            )}
            {ex.name && ex.name !== "Custom" && (
              <ExerciseFields exName={ex.name} data={ex.data} onChange={d => setExData(i, d)} userWeightKg={weightKg}/>
            )}
          </div>
        );
      })}

      <button onClick={() => setExs(p => [...p, newEx()])} style={{ background:"none", border:"1px dashed #22d3ee44", borderRadius:12, width:"100%", padding:"12px", color:"#22d3ee", fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
        <Plus size={15}/> Add exercise
      </button>

      <button className="vh-btn-primary" disabled={isLoading} onClick={() => {
        const exercise_list = exs.filter(ex => ex.name && ex.name!=="Custom").map(ex => {
          const info = getExercise(ex.name);
          if (info?.type==="cardio"||info?.type==="timed") {
            return { name:ex.name, sets:[{ set_number:1, reps:parseFloat(ex.data.duration_min||ex.data.duration_sec)||0, weight_kg:parseFloat(ex.data.distance_km)||0 }] };
          }
          return { name:ex.name, sets:(ex.data.sets||[]).map(s => ({ set_number:s.set_number, reps:parseInt(s.reps)||0, weight_kg:parseFloat(s.weight_kg)||0 })) };
        });
        submit({ workout_name:name||"Workout", exercise_list, calories_burned:totalCals||undefined, duration_minutes:dur?parseInt(dur):undefined });
      }}>
        {isLoading ? "Saving…" : "Log Workout"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN LOG PAGE
// ══════════════════════════════════════════════════════════════
const TABS = [
  { id:"vitals",  label:"Vitals",  icon:Activity },
  { id:"workout", label:"Workout", icon:Dumbbell },
  { id:"meal",    label:"Meal",    icon:Utensils },
];

export default function LogPage() {
  const [tab, setTab] = useState("vitals");
  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", color:"var(--vh-text)", minHeight:"100vh" }}>
      <PageHeader title="Log Entry" subtitle="Record today's health data"/>
      <div className="page-content">
        {/* Banner */}
        <img 
          src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80" 
          alt="Log Food or Workout" 
          className="image-card-banner"
          style={{ marginBottom: 20 }}
        />
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          {TABS.map(({ id, label, icon:Icon }) => {
            const active = tab===id;
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                flex:1, padding:"11px 6px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                border:"none", borderRadius:14, cursor:"pointer", fontFamily:"inherit",
                background: active ? "#22d3ee22" : "var(--vh-surface)",
                boxShadow:  active ? "0 0 0 1px #22d3ee55, var(--neu-inset)" : "var(--neu-raised)",
                color:      active ? "#22d3ee" : "var(--vh-muted)",
                transition:"all .2s",
              }}>
                <Icon size={18}/>
                <span style={{ fontSize:10, fontWeight:active?700:400 }}>{label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ paddingBottom:20 }}>
          {tab==="vitals"  && <VitalsForm/>}
          {tab==="workout" && <WorkoutForm/>}
          {tab==="meal"    && <MealForm/>}
        </div>
      </div>
    </div>
  );
}