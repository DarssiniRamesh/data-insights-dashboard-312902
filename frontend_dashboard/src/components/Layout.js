import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StatusBar } from "./StatusBar";

// PUBLIC_INTERFACE
export function Layout() {
  /** Application shell with sidebar navigation and main content area. */
  const { profile, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="brand-text">
              <div className="brand-title">Data Publishing</div>
              <div className="brand-subtitle">Workflow Portal</div>
            </div>
          </div>
        </div>

        <nav className="nav">
          <NavLink className="nav-link" to="/" end>
            Dashboard
          </NavLink>
          <NavLink className="nav-link" to="/submissions">
            Data Assets
          </NavLink>
          <NavLink className="nav-link" to="/validation">
            Validation
          </NavLink>
          <NavLink className="nav-link" to="/approvals">
            Approvals
          </NavLink>
          <NavLink className="nav-link" to="/publish">
            Publish
          </NavLink>
          <NavLink className="nav-link" to="/audit">
            Audit
          </NavLink>
          <NavLink className="nav-link" to="/evidence">
            Evidence
          </NavLink>
          <NavLink className="nav-link" to="/settings">
            Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="userbox">
            <div className="userbox-name">{profile?.username || "Unknown user"}</div>
            <div className="userbox-roles">
              {(profile?.roles || []).length ? (profile.roles || []).join(", ") : "No roles"}
            </div>
          </div>
          <button className="btn btn-secondary btn-block" onClick={logout} type="button">
            Log out
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">Data Product Publishing</div>
          <StatusBar />
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
