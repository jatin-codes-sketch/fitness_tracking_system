import { useState, useMemo } from "react";
import { Droplets, Plus, Trash2, Coffee, Sun, Moon, Cookie, Search } from "lucide-react";
import { useDiet } from "@/hooks/useData.js";
import { nutritionAPI } from "@/api/client.js";
import { PageHeader, SectionLabel, ErrorBanner, FormField } from "@/components/Spinner.jsx";
import { MEAL_TYPES, FOOD_DB, getFood, calcFoodNutrition } from "@/constants/index.js";

const MEAL_META = {
  breakfast: { icon: Coffee, label:"Breakfast", color:"#fb923c" },
  lunch:     { icon: Sun,    label:"Lunch",     color:"#22d3ee" },
  dinner:    { icon: Moon,   label:"Dinner",    color:"#a78bfa" },
  snack:     { icon: Cookie, label:"Snack",     color:"#34d399" },
};

const GOALS = { calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65 };

function MacroRing({ proteinG, carbsG, fatG }) {
  const total = proteinG + carbsG + fatG || 1;
  const r = 44, circ = 2 * Math.PI * r;
  const segments = [
    { value:proteinG, color:"#22d3ee" },
    { value:carbsG,   color:"#a78bfa" },
    { value:fatG,     color:"#fb923c" },
  ];
  let offset = 0;
  const arcs = segments.map(s => {
    const dash = (s.value / total) * circ;
    const arc = { ...s, dash, offset };
    offset += dash;
    return arc;
  });
  return (
    <div style={{ position:"relative", width:110, height:110 }}>
      <svg width={110} height={110} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={55} cy={55} r={r} fill="none" stroke="var(--vh-depressed)" strokeWidth={12}/>
        {arcs.map((a, i) => (
          <circle key={i} cx={55} cy={55} r={r} fill="none" stroke={a.color} strokeWidth={12}
            strokeDasharray={`${a.dash.toFixed(1)} ${(circ-a.dash).toFixed(1)}`}
            strokeDashoffset={-a.offset}
            style={{ transition:"stroke-dasharray .8s ease" }}/>
        ))}
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:18, fontWeight:700, color:"var(--vh-text)" }}>
          {Math.round(proteinG + carbsG + fatG)}g
        </span>
        <span style={{ fontSize:9, color:"var(--vh-muted)" }}>macros</span>
      </div>
    </div>
  );
}

function WaterBar({ ml, goalMl = 2500 }) {
  const pct  = Math.min(Math.round((ml / goalMl) * 100), 100);
  const cups = Math.floor(ml / 250);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, alignItems:"baseline" }}>
        <span style={{ fontSize:22, fontWeight:700, color:"var(--vh-text)" }}>
          {ml} <span style={{ fontSize:12, color:"var(--vh-muted)", fontWeight:400 }}>ml</span>
        </span>
        <span style={{ fontSize:12, color:"var(--vh-muted)" }}>Goal: {goalMl} ml · {cups} cups</span>
      </div>
      <div style={{ background:"var(--vh-depressed)", boxShadow:"var(--neu-inset)", borderRadius:99, height:12, overflow:"hidden" }}>
        <div style={{
          height:"100%", borderRadius:99, width:`${pct}%`,
          background:"linear-gradient(90deg,#0891b2,#22d3ee)",
          transition:"width .6s cubic-bezier(.4,0,.2,1)",
        }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
        <span style={{ fontSize:10, color:"#22d3ee", fontWeight:700 }}>{pct}% hydrated</span>
        <span style={{ fontSize:10, color:"var(--vh-muted)" }}>
          {goalMl - ml > 0 ? `${goalMl - ml} ml remaining` : "Goal reached! 🎉"}
        </span>
      </div>
    </div>
  );
}

function QuickAddModal({ onClose, onAdded }) {
  const [mealType, setMealType] = useState("breakfast");
  const [search,   setSearch]   = useState("");
  const [picked,   setPicked]   = useState(null); // food from FOOD_DB
  const [manualMode, setManualMode] = useState(false); // manual entry
  const [f, setF] = useState({ name:"", calories:"", protein_g:"", carbs_g:"", fat_g:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const suggestions = useMemo(() => {
    if (!search || picked) return [];
    return FOOD_DB.filter(fd => fd.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6);
  }, [search, picked]);

  // Compute macros from picked food or manual entry
  const preview = useMemo(() => {
    if (picked) {
      const n = calcFoodNutrition(picked.name, picked.defaultQty);
      return { calories: n.calories, protein_g: n.protein_g, carbs_g: n.carbs_g, fat_g: n.fat_g };
    }
    return {
      calories:  parseFloat(f.calories)  || 0,
      protein_g: parseFloat(f.protein_g) || 0,
      carbs_g:   parseFloat(f.carbs_g)   || 0,
      fat_g:     parseFloat(f.fat_g)     || 0,
    };
  }, [picked, f]);

  const handleSave = async () => {
    const name = picked ? picked.name : f.name;
    const cals = picked ? preview.calories : parseFloat(f.calories);
    if (!name || !cals) return setError("Name and calories are required.");
    setLoading(true);
    try {
      await nutritionAPI.logMeal({
        meal_type: mealType, name,
        calories:  cals,
        protein_g: preview.protein_g,
        carbs_g:   preview.carbs_g,
        fat_g:     preview.fat_g,
      });
      onAdded(); onClose();
    } catch (e) {
      setError(e.response?.data?.detail ?? "Failed to log meal.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"var(--vh-surface)", borderRadius:"24px 24px 0 0",
        padding:"20px 20px 36px", width:"100%", maxWidth:430,
        boxShadow:"0 -12px 40px rgba(0,0,0,0.6)",
        animation:"slideUp .3s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{ width:36, height:4, background:"var(--vh-border)", borderRadius:99, margin:"0 auto 20px" }}/>
        <h3 style={{ fontSize:16, fontWeight:800, margin:"0 0 16px", color:"var(--vh-text)", textTransform:"uppercase", letterSpacing:0.5 }}>Add Meal</h3>
        <ErrorBanner message={error} onDismiss={() => setError(null)}/>

        {/* Pill-track meal type selector */}
        <div style={{
          display:"flex", position: "relative", marginBottom:16,
          background: "var(--vh-depressed)", borderRadius: 16, padding: 4,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
        }}>
          <div style={{
            position: "absolute", top: 4, bottom: 4, left: 4,
            width: `calc((100% - 8px) / ${MEAL_TYPES.length})`,
            background: "var(--vh-surface)",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            border: "1px solid var(--vh-border)",
            transform: `translateX(${MEAL_TYPES.findIndex(m => m.value === mealType) * 100}%)`,
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 0
          }} />
          {MEAL_TYPES.map(({ value, label, icon }) => (
            <button key={value} onClick={() => setMealType(value)} style={{
              flex:1, padding:"8px 4px", border:"none", background:"none",
              cursor:"pointer", fontFamily:"inherit", fontSize:10,
              fontWeight: mealType === value ? 700 : 500,
              color: mealType === value ? "var(--gym-accent)" : "var(--vh-muted)",
              transition:"color .3s", position:"relative", zIndex:1,
            }}>
              <div style={{ fontSize:14 }}>{icon}</div>
              <div>{label}</div>
            </button>
          ))}
        </div>

        {/* Food search */}
        <div style={{ position:"relative", marginBottom: picked ? 12 : 0 }}>
          <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
            <Search size={14} color="var(--vh-muted)" style={{ position:"absolute", left:12, zIndex:1, pointerEvents:"none" }}/>
            <input
              className="vh-input"
              placeholder="Search food database…"
              value={picked ? picked.name : search}
              onChange={e => { setSearch(e.target.value); setPicked(null); }}
              style={{ paddingLeft:36, paddingRight:36 }}
            />
            {(search || picked) && (
              <button onClick={() => { setSearch(""); setPicked(null); }} style={{
                position:"absolute", right:10, background:"none", border:"none",
                cursor:"pointer", color:"var(--vh-muted)", padding:4, display:"flex"
              }}>
                ✕
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div style={{
              position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:9999,
              background:"var(--vh-surface)", border:"1px solid var(--vh-border)",
              borderRadius:12, boxShadow:"0 12px 32px rgba(0,0,0,0.5)",
              maxHeight:220, overflowY:"auto"
            }}>
              {suggestions.map(fd => (
                <button key={fd.name} onClick={() => { setPicked(fd); setSearch(""); }} style={{
                  width:"100%", padding:"10px 14px", background:"none", border:"none",
                  cursor:"pointer", fontFamily:"inherit", textAlign:"left",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  borderBottom:"1px solid var(--vh-border)",
                  color:"var(--vh-text)", fontSize:13, transition:"background 0.15s",
                }}>
                  <span>{fd.name}</span>
                  <span style={{ fontSize:10, color:"var(--vh-muted)" }}>
                    {Math.round(calcFoodNutrition(fd.name, fd.defaultQty).calories)} kcal
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Manual entry toggle */}
        {!picked && (
          <button onClick={() => setManualMode(m => !m)} style={{
            background:"none", border:"none", color:"var(--vh-muted)",
            fontSize:11, cursor:"pointer", fontFamily:"inherit", marginTop:6, marginBottom:12,
            padding:0, textDecoration:"underline"
          }}>
            {manualMode ? "Hide manual entry" : "Enter macros manually instead"}
          </button>
        )}

        {manualMode && !picked && (
          <>
            <FormField label="Food name">
              <input className="vh-input" placeholder="e.g. Oatmeal with berries" value={f.name} onChange={set("name")}/>
            </FormField>
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              {[
                { k:"calories",  label:"Kcal",      p:"350" },
                { k:"protein_g", label:"Protein g",  p:"20"  },
                { k:"carbs_g",   label:"Carbs g",    p:"45"  },
                { k:"fat_g",     label:"Fat g",      p:"8"   },
              ].map(({ k, label, p }) => (
                <div key={k} style={{ flex:1 }}>
                  <label style={{ fontSize:9, color:"var(--vh-muted)", fontWeight:600, display:"block", marginBottom:4 }}>{label}</label>
                  <input className="vh-input" type="number" placeholder={p} value={f[k]} onChange={set(k)} style={{ padding:"9px 8px", fontSize:13 }}/>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Ghost-fill Macro Preview */}
        {(picked || preview.calories > 0) && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
            {[
              { label:"Calories", value:preview.calories,  goal:GOALS.calories,  unit:"kcal", color:"var(--gym-accent)" },
              { label:"Protein",  value:preview.protein_g, goal:GOALS.protein_g, unit:"g",    color:"#a78bfa" },
              { label:"Carbs",    value:preview.carbs_g,   goal:GOALS.carbs_g,   unit:"g",    color:"#34d399" },
              { label:"Fat",      value:preview.fat_g,     goal:GOALS.fat_g,     unit:"g",    color:"#fb923c" },
            ].map(({ label, value, goal, unit, color }) => {
              const pct = Math.min((value / goal) * 100, 100);
              return (
                <div key={label} title={`${Math.round(pct)}% of daily ${label}`} style={{
                  flex:"1 1 calc(25% - 6px)", textAlign:"center", padding:"8px 0",
                  position:"relative", overflow:"hidden", borderRadius:8,
                  border:"1px solid var(--vh-border)"
                }}>
                  <div style={{
                    position:"absolute", bottom:0, left:0, top:0,
                    width:`${pct}%`, background:`${color}22`,
                    transition:"width 0.3s ease-out", zIndex:0
                  }} />
                  <div style={{ position:"relative", zIndex:1 }}>
                    <p style={{ fontSize:9, color:"var(--vh-muted)", margin:"0 0 2px", textTransform:"uppercase" }}>{label}</p>
                    <p style={{ margin:0, fontWeight:700, color, fontSize:15 }}>
                      {Math.round(value)}<span style={{ fontSize:10, fontWeight:400 }}>{unit}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{
            flex:"0 0 auto", padding:"13px 20px", borderRadius:14,
            background:"none", border:"1px solid var(--vh-border)",
            color:"var(--vh-muted)", cursor:"pointer", fontFamily:"inherit", fontSize:14,
          }}>Cancel</button>
          <button className="vh-btn-primary" onClick={handleSave} disabled={loading} style={{ flex:1 }}>
            {loading ? "Saving…" : "Save Meal"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const { data:diet, isLoading, refetch, addWater } = useDiet();
  const [showModal, setShowModal] = useState(false);

  const meals    = diet?.meal_list ?? [];
  const totalCal = diet?.total_calories ?? 0;
  const waterMl  = diet?.total_water_ml ?? 0;
  const proteinG = diet?.total_protein_g ?? 0;
  const carbsG   = diet?.total_carbs_g   ?? 0;
  const fatG     = diet?.total_fat_g     ?? 0;

  const grouped = meals.reduce((acc, m) => {
    if (!acc[m.meal_type]) acc[m.meal_type] = [];
    acc[m.meal_type].push(m);
    return acc;
  }, {});

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", color:"var(--vh-text)", minHeight:"100vh" }}>
      <PageHeader
        title="Nutrition"
        subtitle={new Date().toLocaleDateString("en", { weekday:"long", month:"long", day:"numeric" })}
        action={
          <button onClick={() => setShowModal(true)} style={{
            background:"linear-gradient(135deg,#22d3ee,#0891b2)", border:"none",
            borderRadius:12, padding:"8px 14px", color:"#0f172a",
            fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
            display:"flex", alignItems:"center", gap:5, boxShadow:"0 4px 12px #22d3ee44",
          }}>
            <Plus size={14}/> Add
          </button>
        }
      />

      <div className="page-content" style={{ display:"flex", flexDirection:"column", gap:14 }}>

        {/* Calorie + Macro summary */}
        <div style={{ background:"var(--vh-surface)", boxShadow:"var(--neu-raised)", borderRadius:20, padding:18 }}>
          <div style={{ display:"flex", gap:16, alignItems:"center" }}>
            <MacroRing proteinG={proteinG} carbsG={carbsG} fatG={fatG}/>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:28, fontWeight:700, margin:"0 0 2px", letterSpacing:-1, color:"var(--vh-text)" }}>
                {Math.round(totalCal).toLocaleString()}
                <span style={{ fontSize:13, color:"var(--vh-muted)", fontWeight:400, marginLeft:4 }}>kcal</span>
              </p>
              <p style={{ fontSize:11, color:"var(--vh-muted)", margin:"0 0 12px" }}>consumed today</p>
              {[
                { label:"Protein", value:proteinG, color:"#22d3ee" },
                { label:"Carbs",   value:carbsG,   color:"#a78bfa" },
                { label:"Fat",     value:fatG,     color:"#fb923c" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:11, color:"var(--vh-muted)" }}>
                    <span style={{ display:"inline-block", width:8, height:8, borderRadius:2, background:color, marginRight:5 }}/>
                    {label}
                  </span>
                  <span style={{ fontSize:11, fontWeight:700, color:"var(--vh-text)" }}>{Math.round(value)}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Water */}
        <div style={{ background:"var(--vh-surface)", boxShadow:"var(--neu-raised)", borderRadius:20, padding:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <Droplets size={16} color="#22d3ee"/>
            <p style={{ fontWeight:700, fontSize:14, margin:0, color:"var(--vh-text)" }}>Hydration</p>
          </div>
          <WaterBar ml={waterMl} goalMl={2500}/>
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            {[250,500].map(ml => (
              <button key={ml} onClick={() => addWater(ml)} style={{
                flex:1, padding:"11px 0", borderRadius:14, border:"none",
                background:"var(--vh-depressed)", boxShadow:"var(--neu-inset)",
                color:"#22d3ee", fontWeight:700, fontSize:13,
                cursor:"pointer", fontFamily:"inherit",
                display:"flex", alignItems:"center", justifyContent:"center", gap:5,
              }}>
                💧 +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* Meals list */}
        <div>
          <SectionLabel>Today's meals</SectionLabel>
          {isLoading && <p style={{ color:"var(--vh-muted)", fontSize:13, textAlign:"center", padding:"20px 0" }}>Loading…</p>}
          {!isLoading && meals.length === 0 && (
            <div style={{ background:"var(--vh-surface)", boxShadow:"var(--neu-raised)", borderRadius:18, padding:"32px 20px", textAlign:"center" }}>
              <p style={{ fontSize:32, marginBottom:10 }}>🍽</p>
              <p style={{ fontWeight:700, margin:"0 0 6px", color:"var(--vh-text)" }}>No meals logged yet</p>
              <p style={{ color:"var(--vh-muted)", fontSize:13, margin:0 }}>Tap "Add" to log your first meal today.</p>
            </div>
          )}
          {Object.entries(grouped).map(([type, items]) => {
            const meta = MEAL_META[type] ?? { label:type, color:"#64748b", icon:Cookie };
            const Icon = meta.icon;
            const typeTotal = items.reduce((a, m) => a + m.calories, 0);
            return (
              <div key={type} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <Icon size={13} color={meta.color}/>
                  <span style={{ fontSize:11, fontWeight:700, color:meta.color, textTransform:"capitalize" }}>{meta.label}</span>
                  <span style={{ fontSize:10, color:"var(--vh-muted)", marginLeft:"auto" }}>{Math.round(typeTotal)} kcal</span>
                </div>
                {items.map((meal, i) => (
                  <div key={i} style={{
                    background:"var(--vh-surface)", boxShadow:"var(--neu-raised)",
                    borderRadius:14, padding:"12px 14px", marginBottom:8,
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                  }}>
                    <div>
                      <p style={{ margin:0, fontSize:14, fontWeight:600, color:"var(--vh-text)" }}>{meal.name}</p>
                      <p style={{ margin:"3px 0 0", fontSize:10, color:"var(--vh-muted)" }}>
                        P: {meal.protein_g}g · C: {meal.carbs_g}g · F: {meal.fat_g}g
                      </p>
                    </div>
                    <span style={{ background:`${meta.color}22`, color:meta.color, fontSize:12, fontWeight:700, borderRadius:99, padding:"4px 10px" }}>
                      {meal.calories} kcal
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && <QuickAddModal onClose={() => setShowModal(false)} onAdded={refetch}/>}
    </div>
  );
}