import React from "react";

// PUBLIC_INTERFACE
export function ErrorBanner({ title = "Error", message, details }) {
  /** Renders a consistent error banner. */
  if (!message) return null;
  return (
    <div className="ui-alert ui-alert-error" role="alert" aria-live="polite">
      <div className="ui-alert-title">{title}</div>
      <div className="ui-alert-message">{message}</div>
      {details ? <pre className="ui-alert-details">{details}</pre> : null}
    </div>
  );
}
