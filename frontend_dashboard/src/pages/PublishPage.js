import React, { useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingPill } from "../components/LoadingPill";
import { submissionsApi } from "../api/endpoints";

// PUBLIC_INTERFACE
export function PublishPage() {
  /** Publish a submission (compat endpoint). */
  const [submissionId, setSubmissionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  async function onPublish() {
    setErrorMsg("");
    setResult(null);

    if (!submissionId.trim()) {
      setErrorMsg("Enter a submission ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await submissionsApi.publishCompat(submissionId.trim());
      setResult(res);
    } catch (err) {
      setErrorMsg(err.message || "Publish failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Publish</h1>
      <p className="page-subtitle">Publish an approved submission and view published URI.</p>

      <ErrorBanner message={errorMsg} />

      <div className="card">
        <h2 className="card-title">Publish submission</h2>

        <div className="grid-2">
          <label className="field">
            <span className="field-label">Submission ID</span>
            <input
              className="input"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
            />
          </label>

          <div className="field">
            <span className="field-label">Action</span>
            <button className="btn btn-primary" type="button" onClick={onPublish} disabled={loading}>
              Publish (compat)
            </button>
            {loading ? <LoadingPill /> : null}
          </div>
        </div>

        <div className="help">
          Compat contract: endpoint is designed to avoid 500s and return deterministic responses.
        </div>
      </div>

      {result ? (
        <div className="card">
          <h2 className="card-title">Publish response</h2>
          <pre className="codeblock">{JSON.stringify(result, null, 2)}</pre>
          <div className="help">
            If the backend returns a published URI field, it will be shown above as part of the JSON.
          </div>
        </div>
      ) : null}
    </div>
  );
}
