/**
 * VitalityHub — History Page (date-wise view)
 * Groups workouts and vitals by date for systematic tracking.
 */
import { useState, useMemo } from "react";
import { Dumbbell, Activity, ChevronDown, ChevronUp, Calendar, Filter } from "lucide-react";
import { useWorkoutHistory, useVitals } from "@/hooks/useData.js";
import { PageHeader, SectionLabel, StatCard } from "@/components/Spinner.jsx";
import { format, isToday, isYesterday, parseISO, startOfDay } from "date-fns";

// ─── Group items by calendar date ─────────────────────────────────────────
function groupByDate(items, getDate) {
  const groups = {};
  items.forEach(item => {
    const d = startOfDay(new Date(getDate(item))).toISOString();
    if (!groups[d]) groups[d] = [];
    groups[d].push(item);
  });
  return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a));
}

function dateLabel(isoDate) {
  const d = new Date(isoDate);
  if (isToday(d))     return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, d MMMM yyyy");
}

// ─── Workout Card ─────────────────────────────────────────────────────────
function WorkoutCard({ session }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:"var(--vh-surface)", boxShadow:"var(--neu-raised)", borderRadius:14, marginBottom:8, overflow:"hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center",
        background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:"var(--vh-text)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"#22d3ee22", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Dumbbell size={15} color="#22d3ee"/>
          </div>
          <div style={{ textAlign:"left" }}>
            <p style={{ margin:0, fontWeight:700, fontSize:14, color:"var(--vh-text)" }}>{session.workout_name}</p>
            <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--vh-muted)" }}>
              {format(new Date(session.timestamp), "h:mm a")}
              {session.duration_minutes ? ` · ${session.duration_minutes} min` : ""}
              {" · "}{session.total_sets} sets
            </p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {session.calories_burned > 0 && (
            <span style={{ background:"#fb923c22", color:"#fb923c", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700 }}>
              🔥 {session.calories_burned} kcal
            </span>
          )}
          {open ? <ChevronUp size={15} color="var(--vh-muted)"/> : <ChevronDown size={15} color="var(--vh-muted)"/>}
        </div>
      </button>

      {open && (
        <div style={{ padding:"0 16px 14px", borderTop:"1px solid var(--vh-border)33" }}>
          <div style={{ display:"flex", gap:10, marginTop:12, flexWrap:"wrap" }}>
            {[
              { label:"Volume",   value:`${session.total_volume_kg} kg`, color:"#22d3ee" },
              { label:"Sets",     value:session.total_sets,              color:"#a78bfa"  },
              { label:"Reps",     value:session.total_reps,              color:"#34d399"  },
              { label:"Calories", value:session.calories_burned ? `${session.calories_burned} kcal` : "—", color:"#fb923c" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background:"var(--vh-depressed)", boxShadow:"var(--neu-inset)",
                borderRadius:12, padding:"10px 14px", flex:"1 1 calc(50% - 6px)",
              }}>
                <p style={{ fontSize:10, color:"var(--vh-muted)", margin:"0 0 3px" }}>{label}</p>
                <p style={{ fontSize:15, fontWeight:700, margin:0, color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vitals Row ───────────────────────────────────────────────────────────
function VitalsRow({ record }) {
  const bp = record.blood_pressure_sys && record.blood_pressure_dia
    ? `${record.blood_pressure_sys}/${record.blood_pressure_dia}`
    : null;
  return (
    <div style={{
      background:"var(--vh-surface)", boxShadow:"var(--neu-raised)",
      borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:8,
    }}>
      <div style={{ width:34, height:34, borderRadius:10, background:"#f8717122", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Activity size={15} color="#f87171"/>
      </div>
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontSize:11, color:"var(--vh-muted)", marginBottom:4 }}>
          {format(new Date(record.timestamp), "h:mm a")}
        </p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {record.heart_rate  && <span style={{ fontSize:13, fontWeight:700, color:"#f87171" }}>❤️ {record.heart_rate} bpm</span>}
          {record.blood_sugar && <span style={{ fontSize:13, fontWeight:700, color:"#fb923c" }}>🩸 {record.blood_sugar} mmol/L</span>}
          {bp                 && <span style={{ fontSize:13, fontWeight:700, color:"#a78bfa" }}>⚡ {bp} mmHg</span>}
          {record.spo2        && <span style={{ fontSize:13, fontWeight:700, color:"#34d399" }}>🌬️ {record.spo2}%</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Date Group ───────────────────────────────────────────────────────────
function DateGroup({ isoDate, children, count, summary }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom:20 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", display:"flex", alignItems:"center", gap:10,
        background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
        marginBottom: open ? 10 : 0, padding:"4px 0",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
          <Calendar size={14} color="#22d3ee"/>
          <span style={{ fontSize:13, fontWeight:700, color:"var(--vh-text)" }}>
            {dateLabel(isoDate)}
          </span>
          <span style={{ fontSize:11, color:"var(--vh-muted)", background:"var(--vh-surface)", borderRadius:99, padding:"2px 8px", boxShadow:"var(--neu-raised)" }}>
            {count} {count === 1 ? "entry" : "entries"}
          </span>
        </div>
        {summary && <span style={{ fontSize:11, color:"#fb923c", fontWeight:700 }}>{summary}</span>}
        {open ? <ChevronUp size={14} color="var(--vh-muted)"/> : <ChevronDown size={14} color="var(--vh-muted)"/>}
      </button>
      {open && (
        <div style={{ paddingLeft:4, animation:"fadeIn .2s ease" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
const DAY_OPTIONS = [7, 30, 60, 90];

export default function HistoryPage() {
  const [days, setDays] = useState(30);
  const [tab,  setTab]  = useState("workouts");

  const { data: workouts, isLoading: wl } = useWorkoutHistory(days);
  const { data: vitals,   isLoading: vl } = useVitals(days);
  const loading = tab === "workouts" ? wl : vl;

  // Group by date
  const workoutGroups = useMemo(() =>
    groupByDate(workouts || [], s => s.timestamp),
    [workouts]
  );
  const vitalsGroups = useMemo(() =>
    groupByDate(vitals?.records || [], r => r.timestamp),
    [vitals]
  );

  // Summary stats
  const totalVolume = (workouts || []).reduce((a, s) => a + s.total_volume_kg, 0).toFixed(0);
  const totalCals   = (workouts || []).reduce((a, s) => a + (s.calories_burned || 0), 0);
  const totalReps   = (workouts || []).reduce((a, s) => a + s.total_reps, 0);

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", color:"var(--vh-text)" }}>
      <PageHeader title="History" subtitle="Date-wise activity log"/>

      <div className="page-content">

        {/* Range filter */}
        <div style={{ display:"flex", gap:8, marginBottom:14, alignItems:"center" }}>
          <Filter size={13} color="var(--vh-muted)"/>
          {DAY_OPTIONS.map(d => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding:"6px 14px", borderRadius:99, border:"none", cursor:"pointer",
              fontFamily:"inherit", fontWeight:days===d?700:400, fontSize:12,
              background: days===d ? "#22d3ee" : "var(--vh-surface)",
              color: days===d ? "#0f172a" : "var(--vh-muted)",
              boxShadow: days===d ? "0 2px 8px #22d3ee55" : "var(--neu-raised)",
              transition:"all .2s",
            }}>
              {d === 7 ? "1 week" : d === 30 ? "1 month" : d === 60 ? "2 months" : "3 months"}
            </button>
          ))}
        </div>

        {/* Summary stats — workouts only */}
        {tab === "workouts" && workouts && workouts.length > 0 && (
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
            <StatCard label="Sessions"     value={workouts.length}  icon="🏋️" color="#22d3ee"/>
            <StatCard label="Total Volume" value={`${totalVolume} kg`} icon="📊" color="#a78bfa"/>
            <StatCard label="Kcal Burned"  value={`${totalCals}`}   icon="🔥" color="#fb923c"/>
            <StatCard label="Total Reps"   value={totalReps}        icon="🔁" color="#34d399"/>
          </div>
        )}

        {/* Tab toggle */}
        <div style={{ display:"flex", gap:8, marginBottom:16, background:"var(--vh-depressed)", boxShadow:"var(--neu-inset)", borderRadius:14, padding:4 }}>
          {[
            { id:"workouts", label:"💪 Workouts" },
            { id:"vitals",   label:"❤️  Vitals"  },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, padding:"9px", borderRadius:11, border:"none",
              cursor:"pointer", fontFamily:"inherit", fontSize:13,
              fontWeight: tab===id ? 700 : 400,
              background: tab===id ? "var(--vh-surface)" : "transparent",
              color: tab===id ? "var(--vh-text)" : "var(--vh-muted)",
              boxShadow: tab===id ? "var(--neu-raised)" : "none",
              transition:"all .2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Date-grouped list */}
        {loading && (
          <div style={{ textAlign:"center", padding:"40px 0", color:"var(--vh-muted)" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>⏳</div>
            <p style={{ fontSize:14 }}>Loading history…</p>
          </div>
        )}

        {!loading && tab === "workouts" && (
          workoutGroups.length === 0
            ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:"var(--vh-muted)" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🏋️</div>
                <p style={{ fontWeight:700, fontSize:15, color:"var(--vh-text)", marginBottom:6 }}>No workouts yet</p>
                <p style={{ fontSize:13 }}>Start logging your workouts in the Log tab.</p>
              </div>
            )
            : workoutGroups.map(([date, sessions]) => {
              const dayKcal = sessions.reduce((a, s) => a + (s.calories_burned || 0), 0);
              return (
                <DateGroup key={date} isoDate={date} count={sessions.length}
                  summary={dayKcal > 0 ? `🔥 ${dayKcal} kcal` : null}>
                  {sessions.map(s => <WorkoutCard key={s.id} session={s}/>)}
                </DateGroup>
              );
            })
        )}

        {!loading && tab === "vitals" && (
          vitalsGroups.length === 0
            ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:"var(--vh-muted)" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>❤️</div>
                <p style={{ fontWeight:700, fontSize:15, color:"var(--vh-text)", marginBottom:6 }}>No vitals logged</p>
                <p style={{ fontSize:13 }}>Log your first vital signs in the Log tab.</p>
              </div>
            )
            : vitalsGroups.map(([date, records]) => (
              <DateGroup key={date} isoDate={date} count={records.length}>
                {records.map(r => <VitalsRow key={r.id} record={r}/>)}
              </DateGroup>
            ))
        )}

      </div>
    </div>
  );
}