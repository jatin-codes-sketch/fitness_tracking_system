/**
 * VitalityHub — Dashboard Page (live data wrapper)
 * Fetches vitals + diet data and passes them into the Dashboard component.
 */

import { useAuth } from "@/context/AuthContext.jsx";
import { useVitals, useDiet } from "@/hooks/useData.js";
import Dashboard from "@/components/Dashboard.jsx";
import Spinner from "@/components/Spinner.jsx";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats,   isLoading: vitalsLoading }  = useVitals(30);
  const { data: diet,    isLoading: dietLoading,
          addWater }                                   = useDiet();

  if (vitalsLoading || dietLoading) return <Spinner />;

  // Most-recent record for current vitals display
  const latest = stats?.records?.[0] ?? {};

  return (
    <Dashboard
      user={{
        name:        user?.email?.split("@")[0] ?? "You",
        caloricGoal: user?.caloricGoal ?? 2000,
      }}
      vitals={{
        heartRate:       latest.heart_rate,
        bpSys:           latest.blood_pressure_sys,
        bpDia:           latest.blood_pressure_dia,
        bloodSugar:      latest.blood_sugar,
        spo2:            latest.spo2,
      }}
      diet={{
        totalCalories: diet?.total_calories ?? 0,
        totalWaterMl:  diet?.total_water_ml ?? 0,
        totalProteinG: diet?.total_protein_g ?? 0,
        totalCarbsG:   diet?.total_carbs_g ?? 0,
        totalFatG:     diet?.total_fat_g ?? 0,
      }}
      chartData={(stats?.records ?? [])
        .slice(0, 14)
        .reverse()
        .map((r) => ({
          date:       new Date(r.timestamp).toLocaleDateString("en", { month: "short", day: "numeric" }),
          heartRate:  r.heart_rate,
          bloodSugar: r.blood_sugar,
        }))}
      onAddWater={addWater}
    />
  );
}