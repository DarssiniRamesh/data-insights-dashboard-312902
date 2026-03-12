import React from "react";
import { useAuth } from "../context/AuthContext";
import { getResolvedApiBaseForDiagnostics } from "../api/client";

// PUBLIC_INTERFACE
export function SettingsPage() {
  /** Settings and diagnostics page. */
  const { profile } = useAuth();

  const apiBase = getResolvedApiBaseForDiagnostics();

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Environment and account details.</p>

      <div className="card">
        <h2 className="card-title">Backend connection</h2>
        <div className="kv">
          <div className="kv-k">API base URL</div>
          <div className="kv-v mono">{apiBase}</div>
        </div>
        <div className="help">
          Configure using <code>REACT_APP_API_BASE</code>. Default is the same-origin platform ingress
          path <code>/proxy/3001</code> (avoids direct <code>:3001</code> browser calls and does not
          rely on CRA dev-server proxy middleware).
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Current user</h2>
        <pre className="codeblock">{JSON.stringify(profile, null, 2)}</pre>
      </div>
    </div>
  );
}
