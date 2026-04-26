/**
 * VitalityHub — Global Theme Toggle
 * Sun/Moon button shown top-right on every page header.
 */
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 38, height: 38, borderRadius: 12,
        background: "var(--vh-surface)",
        boxShadow: "var(--neu-raised)",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s ease", flexShrink: 0,
      }}
    >
      {isDark
        ? <Sun  size={17} color="#fb923c" />
        : <Moon size={17} color="#a78bfa" />
      }
    </button>
  );
}