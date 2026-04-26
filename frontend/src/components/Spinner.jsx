/**
 * VitalityHub — Shared UI Primitives (theme-aware)
 * PageHeader now always includes ThemeToggle top-right.
 */
import ThemeToggle from "@/components/ThemeToggle.jsx";

export default function Spinner() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--vh-bg)",
    }}>
      <div className="gym-loader">
        <div className="gym-plate"></div>
        <div className="gym-plate"></div>
        <div className="gym-plate"></div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      padding: "20px 18px 14px",
      background: "var(--header-grad)",
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, margin: 0, color: "var(--vh-text)" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--vh-muted)", margin: "3px 0 0" }}>{subtitle}</p>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {action}
        <ThemeToggle />
      </div>
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, color: "var(--vh-muted)",
      letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px",
    }}>
      {children}
    </p>
  );
}

export function StatCard({ label, value, unit, color = "#22d3ee", icon }) {
  return (
    <div style={{
      background: "var(--vh-surface)", boxShadow: "var(--neu-raised)",
      borderRadius: 16, padding: "14px 12px", flex: "1 1 calc(50% - 6px)",
    }}>
      {icon && (
        <div style={{
          width: 28, height: 28, borderRadius: 9, background: `${color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 8, fontSize: 13,
        }}>{icon}</div>
      )}
      <p style={{ fontSize: 10, color: "var(--vh-muted)", fontWeight: 500, margin: "0 0 4px" }}>{label}</p>
      <p style={{ margin: 0 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--vh-text)", letterSpacing: -0.5 }}>
          {value ?? "—"}
        </span>
        {unit && <span style={{ fontSize: 11, color: "var(--vh-muted)", marginLeft: 4 }}>{unit}</span>}
      </p>
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{
      background: "#f8717122", border: "1px solid #f8717144",
      borderRadius: 12, padding: "10px 14px", margin: "0 0 14px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontSize: 13, color: "#f87171",
    }}>
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{
          background: "none", border: "none", color: "#f87171",
          cursor: "pointer", padding: 0, fontSize: 16, lineHeight: 1,
        }}>✕</button>
      )}
    </div>
  );
}

export function FormField({ label, children, error, style }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <label style={{
        display: "block", fontSize: 11, color: "var(--vh-muted)",
        fontWeight: 600, marginBottom: 6,
      }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 11, color: "#f87171", margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}