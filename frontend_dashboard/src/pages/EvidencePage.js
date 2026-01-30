import React, { useState } from "react";
import { evidenceApi } from "../api/endpoints";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingPill } from "../components/LoadingPill";

// PUBLIC_INTERFACE
export function EvidencePage() {
  /** Evidence package viewer (by ID). */
  const [evidenceId, setEvidenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [evidence, setEvidence] = useState(null);

  async function onLoad() {
    setErrorMsg("");
    setEvidence(null);

    if (!evidenceId.trim()) {
      setErrorMsg("Enter an evidence package ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await evidenceApi.getEvidencePackage(evidenceId.trim());
      setEvidence(res);
    } catch (err) {
      setErrorMsg(err.message || "Failed to load evidence package.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Evidence</h1>
      <p className="page-subtitle">View evidence package details and referenced artifacts.</p>

      <ErrorBanner message={errorMsg} />

      <div className="card">
        <h2 className="card-title">Load evidence package</h2>
        <div className="grid-2">
          <label className="field">
            <span className="field-label">Evidence package ID</span>
            <input
              className="input"
              value={evidenceId}
              onChange={(e) => setEvidenceId(e.target.value)}
            />
          </label>

          <div className="field">
            <span className="field-label">Action</span>
            <button className="btn btn-primary" type="button" onClick={onLoad} disabled={loading}>
              Load
            </button>
            {loading ? <LoadingPill /> : null}
          </div>
        </div>

        <div className="help">
          A 409 may indicate evidence integrity violation; a 404 indicates missing evidence ID.
        </div>
      </div>

      {evidence ? (
        <div className="card">
          <h2 className="card-title">Evidence package</h2>

          <div className="grid-2">
            <div className="kv">
              <div className="kv-k">Evidence package</div>
              <div className="kv-v mono">{evidence.evidence_package_id}</div>
            </div>
            <div className="kv">
              <div className="kv-k">Minted identifier</div>
              <div className="kv-v mono">{evidence.minted_identifier}</div>
            </div>
            <div className="kv">
              <div className="kv-k">Package</div>
              <div className="kv-v mono">
                {evidence.package_id}@{evidence.package_version}
              </div>
            </div>
            <div className="kv">
              <div className="kv-k">Created</div>
              <div className="kv-v mono">{evidence.created_at_utc}</div>
            </div>
          </div>

          <h3 className="section-title">Artifacts</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>ID</th>
                  <th>Hash</th>
                  <th>Storage</th>
                </tr>
              </thead>
              <tbody>
                {(evidence.artifacts || []).map((a) => (
                  <tr key={`${a.artifact_type}:${a.artifact_id}`}>
                    <td>{a.artifact_type}</td>
                    <td className="mono">{a.artifact_id}</td>
                    <td className="mono">{a.hash_sha256}</td>
                    <td className="mono">{a.storage_ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="section-title">Raw</h3>
          <pre className="codeblock">{JSON.stringify(evidence, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
