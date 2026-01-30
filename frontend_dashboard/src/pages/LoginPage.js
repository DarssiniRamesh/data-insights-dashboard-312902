import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ErrorBanner } from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function LoginPage() {
  /** Login page for the portal. */
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password) {
      setErrorMsg("Please provide username and password.");
      return;
    }

    try {
      await login({ username: username.trim(), password });
      const to = location.state?.from || "/";
      nav(to, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || "Login failed.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="page-title">Sign in</h1>
        <p className="page-subtitle">Access the data product publishing workflow.</p>

        <ErrorBanner message={errorMsg} />

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span className="field-label">Username</span>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Need an account?</span> <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
