import React, { useMemo, useState } from "react";
import { auditApi } from "../api/endpoints";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingPill } from "../components/LoadingPill";

// PUBLIC_INTERFACE
export function AuditPage() {
  /** Audit event query view (restricted to auditor and governance_admin roles server-side). */
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [limit, setLimit] = useState(100);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);

  const pageSize = 25;
  const pages = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < events.length; i += pageSize) chunks.push(events.slice(i, i + pageSize));
    return chunks;
  }, [events]);

  async function onQuery() {
    setErrorMsg("");
    setLoading(true);
    setEvents([]);
    setPage(0);

    try {
      const res = await auditApi.queryEvents({
        entity_type: entityType.trim() || null,
        entity_id: entityId.trim() || null,
        limit: Number(limit) || 100,
      });
      setEvents(res.events || []);
    } catch (err) {
      setErrorMsg(err.message || "Audit query failed.");
    } finally {
      setLoading(false);
    }
  }

  const current = pages[page] || [];

  return (
    <div>
      <h1 className="page-title">Audit</h1>
      <p className="page-subtitle">Query audit trail events and view attributable actions.</p>

      <ErrorBanner message={errorMsg} />

      <div className="card">
        <h2 className="card-title">Query</h2>

        <div className="grid-3">
          <label className="field">
            <span className="field-label">Entity type (optional)</span>
            <input
              className="input"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              placeholder="submission, draft, evidence, ..."
            />
          </label>

          <label className="field">
            <span className="field-label">Entity ID (optional)</span>
            <input className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">Limit (max 1000)</span>
            <input
              className="input"
              type="number"
              min={1}
              max={1000}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </label>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" type="button" onClick={onQuery} disabled={loading}>
            Query events
          </button>
          {loading ? <LoadingPill /> : null}
        </div>

        <div className="help">
          Access is enforced by backend roles (auditor/governance_admin). A 403 indicates insufficient
          permissions.
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Events</h2>

        {!events.length && !loading ? (
          <div className="empty">No events loaded.</div>
        ) : (
          <>
            <div className="toolbar">
              <div className="help">
                Showing {events.length} event(s). Page {page + 1} / {Math.max(pages.length, 1)}
              </div>
              <div className="button-row">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page <= 0}
                >
                  Prev
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
                  disabled={page >= pages.length - 1}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Time (UTC)</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Correlation</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {current.map((e) => (
                    <tr key={e.audit_event_id}>
                      <td className="mono">{e.timestamp_utc}</td>
                      <td className="mono">
                        {e.actor_user_id} <span className="muted">({e.actor_role})</span>
                      </td>
                      <td>{e.event_type}</td>
                      <td className="mono">
                        {e.entity_type}:{e.entity_id}
                      </td>
                      <td className="mono">{e.correlation_id}</td>
                      <td>
                        <span
                          className={`ui-pill ${
                            e.result === "success"
                              ? "ui-pill-success"
                              : e.result === "blocked"
                                ? "ui-pill-muted"
                                : "ui-pill-error"
                          }`}
                        >
                          {e.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
