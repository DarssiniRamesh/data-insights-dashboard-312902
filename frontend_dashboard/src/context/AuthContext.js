import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/endpoints";

const AuthContext = createContext(null);

function loadStoredProfile() {
  const raw = localStorage.getItem("auth_profile");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeProfile(profile) {
  if (!profile) {
    localStorage.removeItem("auth_profile");
    return;
  }
  localStorage.setItem("auth_profile", JSON.stringify(profile));
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state and helpers. */
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [profile, setProfile] = useState(() => loadStoredProfile());
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem("auth_token")) return null;
    const me = await authApi.me();
    setProfile(me);
    storeProfile(me);
    return me;
  }, []);

  useEffect(() => {
    // Attempt to refresh profile if token exists but profile missing/outdated.
    if (token && !profile) {
      refreshProfile().catch(() => {
        // If token is invalid, the api client will redirect on 401.
      });
    }
  }, [token, profile, refreshProfile]);

  const login = useCallback(async ({ username, password }) => {
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      localStorage.setItem("auth_token", res.access_token);
      setToken(res.access_token);
      const me = await authApi.me();
      setProfile(me);
      storeProfile(me);
      return { token: res.access_token, profile: me };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ username, password, roles }) => {
    setLoading(true);
    try {
      const res = await authApi.register({ username, password, roles });
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_profile");
    setToken(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      profile,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [token, profile, loading, isAuthenticated, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook for accessing auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
