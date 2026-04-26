import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Clock, User, Salad } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import UpdateBanner from "@/components/UpdateBanner.jsx";
import Spinner from "@/components/Spinner.jsx";

const Dashboard   = lazy(() => import("@/pages/DashboardPage.jsx"));
const LogPage     = lazy(() => import("@/pages/LogPage.jsx"));
const HistoryPage = lazy(() => import("@/pages/HistoryPage.jsx"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage.jsx"));
const NutritionPage = lazy(() => import("@/pages/NutritionPage.jsx"));
const LoginPage   = lazy(() => import("@/pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage.jsx"));

function RequireAuth({ children }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return token ? children : <Navigate to="/login" replace />;
}
function RedirectIfAuthed({ children }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return token ? <Navigate to="/" replace /> : children;
}

const NAV_ITEMS = [
  { path: "/",          icon: LayoutDashboard, label: "Dashboard" },
  { path: "/log",       icon: PlusCircle,      label: "Log"       },
  { path: "/history",   icon: Clock,           label: "History"   },
  { path: "/nutrition", icon: Salad,           label: "Nutrition" },
  { path: "/profile",   icon: User,            label: "Profile"   },
];

function NavItem({ path, icon: Icon, label, onClick, active, desktop }) {
  const C = { accent: "#22d3ee", muted: "#64748b" };
  if (desktop) {
    return (
      <button onClick={onClick} style={{
        width: "100%", padding: "11px 14px", marginBottom: 4,
        display: "flex", alignItems: "center", gap: 12,
        border: "none", cursor: "pointer", borderRadius: 14,
        fontFamily: "inherit", textAlign: "left",
        background: active ? "#22d3ee18" : "transparent",
        color: active ? C.accent : C.muted,
        transition: "all .2s",
      }}>
        <Icon size={18} color={active ? C.accent : C.muted} />
        <span style={{ fontSize: 14, fontWeight: active ? 700 : 400 }}>{label}</span>
        {active && <div style={{ marginLeft: "auto", width: 3, height: 20, borderRadius: 99, background: C.accent }} />}
      </button>
    );
  }
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "8px 4px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      border: "none", cursor: "pointer", borderRadius: 12, fontFamily: "inherit",
      background: active ? "var(--vh-depressed)" : "var(--vh-surface)",
      boxShadow: active ? "var(--neu-btn-active)" : "var(--neu-btn)",
      transition: "all .15s",
    }}>
      <Icon size={19} color={active ? C.accent : C.muted} />
      <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? C.accent : C.muted }}>
        {label}
      </span>
    </button>
  );
}

function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  return (
    <nav className="side-nav">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, padding: "0 4px" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: "linear-gradient(135deg,#22d3ee22,#a78bfa22)",
          border: "1px solid #22d3ee44",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>💪</div>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--vh-text)" }}>VitalityHub</span>
      </div>
      {NAV_ITEMS.map(({ path, icon, label }) => (
        <NavItem key={path} path={path} icon={icon} label={label}
          active={location.pathname === path}
          onClick={() => navigate(path)} desktop />
      ))}
      <div style={{ marginTop: "auto", padding: "16px 4px 0", borderTop: "1px solid var(--vh-border)" }}>
        <p style={{ fontSize: 10, color: "var(--vh-muted)" }}>VitalityHub v1.0.0</p>
      </div>
    </nav>
  );
}

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="bottom-nav" style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "var(--vh-surface)",
      borderTop: "1px solid var(--vh-border)",
      padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
      gap: 6, zIndex: 100,
      boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
    }}>
      {NAV_ITEMS.map(({ path, icon, label }) => (
        <NavItem key={path} path={path} icon={icon} label={label}
          active={location.pathname === path}
          onClick={() => navigate(path)} />
      ))}
    </nav>
  );
}


function AppShell({ children }) {
  return (
    <div className="app-shell">
      <SideNav />
      <div className="main-content">
        <UpdateBanner />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/login"    element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
          <Route path="/register" element={<RedirectIfAuthed><RegisterPage /></RedirectIfAuthed>} />
          <Route path="/"          element={<RequireAuth><AppShell><Dashboard /></AppShell></RequireAuth>} />
          <Route path="/log"       element={<RequireAuth><AppShell><LogPage /></AppShell></RequireAuth>} />
          <Route path="/history"   element={<RequireAuth><AppShell><HistoryPage /></AppShell></RequireAuth>} />
          <Route path="/nutrition" element={<RequireAuth><AppShell><NutritionPage /></AppShell></RequireAuth>} />
          <Route path="/profile"   element={<RequireAuth><AppShell><ProfilePage /></AppShell></RequireAuth>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}