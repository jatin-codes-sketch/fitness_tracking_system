/**
 * VitalityHub — Theme Context
 * Manages dark / light mode. Persists to localStorage.
 * Applies data-theme attribute to <html> which drives CSS variables.
 */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("vh_theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("vh_theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <ThemeCtx.Provider value={{ isDark, toggle: () => setIsDark((v) => !v) }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}