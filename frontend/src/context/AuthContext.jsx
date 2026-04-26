import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { authAPI } from "@/api/client";

const INIT = { user: null, token: null, isLoading: true, error: null };

function reducer(state, action) {
  switch (action.type) {
    case "RESTORE":  return { ...state, ...action.payload, isLoading: false };
    case "LOGIN_OK": return { ...state, ...action.payload, error: null, isLoading: false };
    case "LOGOUT":   return { ...INIT, isLoading: false };
    case "ERROR":    return { ...state, error: action.payload, isLoading: false };
    case "LOADING":  return { ...state, isLoading: true, error: null };
    default:         return state;
  }
}

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT);

  useEffect(() => {
    const token = localStorage.getItem("vh_token");
    const raw   = localStorage.getItem("vh_user");
    if (token && raw) {
      try { dispatch({ type: "RESTORE", payload: { token, user: JSON.parse(raw) } }); }
      catch { dispatch({ type: "RESTORE", payload: {} }); }
    } else {
      dispatch({ type: "RESTORE", payload: {} });
    }
    const handler = () => dispatch({ type: "LOGOUT" });
    window.addEventListener("vh-unauthorized", handler);
    return () => window.removeEventListener("vh-unauthorized", handler);
  }, []);

  const _persist = useCallback((token, user) => {
    localStorage.setItem("vh_token", token);
    localStorage.setItem("vh_user", JSON.stringify(user));
    dispatch({ type: "LOGIN_OK", payload: { token, user } });
  }, []);

  const login = useCallback(async ({ email, password }) => {
    dispatch({ type: "LOADING" });
    try {
      const { data } = await authAPI.login({ email, password });
      const user = { email, caloricGoal: data.caloric_goal };
      _persist(data.access_token, user);
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.detail ?? "Login failed.";
      dispatch({ type: "ERROR", payload: msg });
      return { ok: false, error: msg };
    }
  }, [_persist]);

  const register = useCallback(async (body) => {
    dispatch({ type: "LOADING" });
    try {
      const { data } = await authAPI.register(body);
      // Store full biometrics so ProfilePage can display them dynamically
      const user = {
        email:       body.email,
        caloricGoal: data.caloric_goal,
        biometrics:  body.biometrics,
      };
      _persist(data.access_token, user);
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.detail ?? "Registration failed.";
      dispatch({ type: "ERROR", payload: msg });
      return { ok: false, error: msg };
    }
  }, [_persist]);

  const logout = useCallback(() => {
    localStorage.removeItem("vh_token");
    localStorage.removeItem("vh_user");
    dispatch({ type: "LOGOUT" });
  }, []);

  const value = useMemo(() => ({ ...state, login, register, logout }), [state, login, register, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}