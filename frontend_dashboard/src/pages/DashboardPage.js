import React, { useCallback, useEffect, useState } from "react";
import { submissionsApi } from "../api/endpoints";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingPill } from "../components/LoadingPill";
import { getTrackedSubmissionIds, untrackSubmissionId } from "../utils/submissionStore";

// PUBLIC_INTERFACE
export function DashboardPage() {
  /** 
   * Dashboard view: shows tracked data assets and their workflow status.
   *
   * Compatibility: uses legacy submissions API (deprecated, use data asset) for backward compatibility.
   */
  const [ids, setIds] = useState(() => getTrackedSubmissionIds());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const refresh = useCallback(async () => {
    setErrorMsg("");
    const currentIds = getTrackedSubmissionIds();
    setIds(currentIds);

    if (!currentIds.length) {
      setRows([]);
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all(
        currentIds.map(async (id) => {
          try {
            const data = await submissionsApi.get(id);
            return { id, ok: true, data };
          } catch (err) {
            return { id, ok: false, error: err.message || "Failed to fetch." };
          }
        })
      );
      setRows(results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Status tracking for your locally tracked data assets.
        <span style={{ display: "block", fontSize: "0.9em", marginTop: "0.25rem", opacity: 0.8 }}>
          (Legacy term: “submission” (deprecated, use data asset))
        </span>
      </p>

      <div className="toolbar">
        <button className="btn btn-secondary" onClick={refresh} type="button">
          Refresh
        </button>
        {loading ? <LoadingPill /> : null}
      </div>

      <ErrorBanner message={errorMsg} />

      <div className="card">
        <h2 className="card-title">Tracked Data Assets</h2>

        {!ids.length ? (
          <div className="empty">
            No tracked data assets yet. Create one in <strong>Data Assets (Submissions)</strong>.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Data Asset ID</th>
                  <th>Package</th>
                  <th>State</th>
                  <th>Validation run</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const s = r.data;
                  return (
                    <tr key={r.id}>
                      <td className="mono">{r.id}</td>
                      <td className="mono">
                        {r.ok ? `${s.package_id}@${s.package_version}` : "—"}
                      </td>
                      <td>
                        {r.ok ? (
                          <span className="ui-pill ui-pill-muted">{s.state}</span>
                        ) : (
                          <span className="ui-pill ui-pill-error">Fetch failed</span>
                        )}
                      </td>
                      <td className="mono">{r.ok ? s.latest_validation_run_id || "—" : "—"}</td>
                      <td className="mono">{r.ok ? s.created_at_utc : "—"}</td>
                      <td className="mono">{r.ok ? s.last_updated_at_utc : "—"}</td>
                      <td className="table-actions">
                        <button
                          className="btn btn-link"
                          type="button"
                          onClick={() => {
                            untrackSubmissionId(r.id);
                            refresh();
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="help">
        Note: This dashboard shows data assets created/tracked in this browser. 
        The backend uses standardized metadata: title, description, and owner.
      </div>
    </div>
  );
}
