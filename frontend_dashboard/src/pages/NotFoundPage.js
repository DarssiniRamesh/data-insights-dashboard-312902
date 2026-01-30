import React from "react";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
export function NotFoundPage() {
  /** 404 page for unknown routes. */
  return (
    <div className="card">
      <h1 className="page-title">Page not found</h1>
      <p className="page-subtitle">The page you requested does not exist.</p>
      <Link className="btn btn-primary" to="/">
        Go to Dashboard
      </Link>
    </div>
  );
}
