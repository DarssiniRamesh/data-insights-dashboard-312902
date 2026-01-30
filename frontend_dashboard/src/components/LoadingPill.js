import React from "react";

// PUBLIC_INTERFACE
export function LoadingPill({ label = "Loading…" }) {
  /** Small inline loading indicator. */
  return <span className="ui-pill ui-pill-muted">{label}</span>;
}
