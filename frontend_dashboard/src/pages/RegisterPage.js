import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorBanner } from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

function toggleRole(set, role) {
  const next = new Set(set);
  if (next.has(role)) next.delete(role);
  else next.add(role);
  return next;
}

// PUBLIC_INTERFACE
export function RegisterPage() {
  /** Registration page (if enabled server-side). */
  const { register, loading } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [rolesSet, setRolesSet] = useState(() => new Set(["publisher"]));

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (username.trim().length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    const roles = [...rolesSet];
    if (!roles.length) {
      setErrorMsg("Select at least one role.");
      return;
    }

    try {
      await register({ username: username.trim(), password, roles });
      setSuccessMsg("Registered successfully. You can now sign in.");
      window.setTimeout(() => nav("/login"), 700);
    } catch (err) {
      setErrorMsg(err.message || "Registration failed.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="page-title">Register</h1>
        <p className="page-subtitle">Create an account for workflow access.</p>

        <ErrorBanner message={errorMsg} title="Registration error" />
        {successMsg ? <div className="ui-alert ui-alert-success">{successMsg}</div> : null}

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
              autoComplete="new-password"
            />
          </label>

          <div className="field">
            <div className="field-label">Roles</div>
            <div className="checkbox-row">
              {["publisher", "steward", "governance_admin", "auditor"].map((r) => (
                <label key={r} className="checkbox">
                  <input
                    type="checkbox"
                    checked={rolesSet.has(r)}
                    onChange={() => setRolesSet((prev) => toggleRole(prev, r))}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <div className="help">
              Note: server-side authorization and SoD rules still apply regardless of selected roles.
            </div>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span> <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
