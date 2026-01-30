import React, { useEffect, useState } from "react";
import { healthApi } from "../api/endpoints";
import { LoadingPill } from "./LoadingPill";

function statusLabel(ok) {
  return ok ? "OK" : "DOWN";
}

// PUBLIC_INTERFACE
export function StatusBar() {
  /** Shows backend liveness and readiness in the header area. */
  const [healthOk, setHealthOk] = useState(null);
  const [readyOk, setReadyOk] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        await healthApi.health();
        if (!cancelled) setHealthOk(true);
      } catch {
        if (!cancelled) setHealthOk(false);
      }

      try {
        await healthApi.ready();
        if (!cancelled) setReadyOk(true);
      } catch {
        if (!cancelled) setReadyOk(false);
      }
    }

    poll();
    const t = window.setInterval(poll, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  return (
    <div className="statusbar" aria-label="Backend status indicators">
      <div className="statusbar-item">
        <span className="statusbar-label">Health</span>
        {healthOk === null ? (
          <LoadingPill label="Checking…" />
        ) : (
          <span className={`ui-pill ${healthOk ? "ui-pill-success" : "ui-pill-error"}`}>
            {statusLabel(healthOk)}
          </span>
        )}
      </div>
      <div className="statusbar-item">
        <span className="statusbar-label">Ready</span>
        {readyOk === null ? (
          <LoadingPill label="Checking…" />
        ) : (
          <span className={`ui-pill ${readyOk ? "ui-pill-success" : "ui-pill-error"}`}>
            {statusLabel(readyOk)}
          </span>
        )}
      </div>
    </div>
  );
}
