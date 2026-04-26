/**
 * VitalityHub — Data Hooks
 * useVitals · useDiet · useWorkoutHistory
 * Each hook manages: data, loading, error, and a refetch callback.
 */

import { useState, useEffect, useCallback } from "react";
import { healthAPI, nutritionAPI, fitnessAPI } from "@/api/client.js";


// ─── Generic fetcher factory ──────────────────────────────────────────────

function useFetch(fetcher, deps = []) {
  const [data,      setData]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  const fetch_ = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message ?? "Unknown error");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, isLoading, error, refetch: fetch_ };
}


// ─── useVitals ────────────────────────────────────────────────────────────

/**
 * Returns health stats for the last N days.
 * data: { records[], avg_heart_rate, avg_blood_sugar, avg_bp_sys, avg_bp_dia }
 */
export function useVitals(days = 30) {
  return useFetch(() => healthAPI.getStats(days), [days]);
}


// ─── useDiet ──────────────────────────────────────────────────────────────

/**
 * Returns today's diet summary.
 * data: { total_calories, total_water_ml, total_protein_g, total_carbs_g, total_fat_g, meals[] }
 */
export function useDiet() {
  const result = useFetch(() => nutritionAPI.getToday());

  const addWater = useCallback(async (ml) => {
    await nutritionAPI.addWater(ml);
    result.refetch();
  }, [result]);

  const logMeal = useCallback(async (body) => {
    await nutritionAPI.logMeal(body);
    result.refetch();
  }, [result]);

  return { ...result, addWater, logMeal };
}


// ─── useWorkoutHistory ────────────────────────────────────────────────────

/**
 * Returns workout sessions for the last N days, sorted newest-first.
 * data: WorkoutOut[]
 */
export function useWorkoutHistory(days = 30) {
  return useFetch(() => fitnessAPI.getHistory(days), [days]);
}


// ─── useLogVitals ─────────────────────────────────────────────────────────

/** Imperative hook for logging a single vitals reading. */
export function useLogVitals() {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);

  const submit = useCallback(async (body) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await healthAPI.logVitals(body);
      setSuccess(true);
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.detail ?? "Failed to log vitals.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { submit, isLoading, error, success };
}


// ─── useLogWorkout ────────────────────────────────────────────────────────

/** Imperative hook for submitting a workout session. */
export function useLogWorkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const [result,    setResult]    = useState(null);

  const submit = useCallback(async (body) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fitnessAPI.logWorkout(body);
      setResult(data);
      return { ok: true, data };
    } catch (err) {
      const msg = err.response?.data?.detail ?? "Failed to log workout.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { submit, isLoading, error, result };
}