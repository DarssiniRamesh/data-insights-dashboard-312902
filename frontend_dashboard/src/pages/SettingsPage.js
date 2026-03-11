import React from "react";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function SettingsPage() {
  /** Settings and diagnostics page. */
  const { profile } = useAuth();

  const apiBase = (() => {
    const PREVIEW_PROXY_API_BASE = "/proxy/3001";

    function normalizeBase(raw) {
      if (!raw) return "";
      const trimmed = String(raw).trim().replace(/\/$/, "");
      if (!trimmed) return "";
      if (trimmed === PREVIEW_PROXY_API_BASE || trimmed.startsWith(`${PREVIEW_PROXY_API_BASE}/`)) {
        return PREVIEW_PROXY_API_BASE;
      }
      if (trimmed.includes("/proxy/3001")) return PREVIEW_PROXY_API_BASE;
      return trimmed;
    }

    const explicit = process.env.REACT_APP_API_BASE;
    if (explicit && explicit.trim()) return normalizeBase(explicit);

    const host = window.location.hostname || "";
    const isPreviewDomain =
      host.includes("preview") ||
      host.includes("kavia") ||
      host.includes("kavia.ai") ||
      host.includes("onrender.com") ||
      host.includes("vercel.app") ||
      host.includes("netlify.app");

    return normalizeBase(isPreviewDomain ? PREVIEW_PROXY_API_BASE : "http://localhost:3001");
  })();

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
          Configure using <code>REACT_APP_API_BASE</code>. Default fallback is{" "}
          <code>http://localhost:3001</code>.
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Current user</h2>
        <pre className="codeblock">{JSON.stringify(profile, null, 2)}</pre>
      </div>
    </div>
  );
}
