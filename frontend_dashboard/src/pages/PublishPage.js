import React, { useState } from "react";
import { submissionsApi } from "../api/endpoints";
import { ErrorBanner } from "../components/ErrorBanner";

// PUBLIC_INTERFACE
export function PublishPage() {
  /**
   * Publish page: publish approved data assets.
   * 
   * Terminology: 'data asset' (formerly 'submission')
   */
  const [submissionId, setSubmissionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function onPublish(e) {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);

    if (!submissionId.trim()) {
      setErrorMsg("Data asset ID is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await submissionsApi.publishCompat(submissionId.trim());
      setResult(res);
      setSubmissionId("");
    } catch (err) {
      setErrorMsg(err.message || "Publish failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Publish</h1>
      <p className="page-subtitle">
        Publish approved data assets via compatibility endpoint.
      </p>

      <div className="card">
        <h2 className="card-title">Publish Data Asset</h2>
        <p className="help" style={{ marginBottom: "1rem" }}>
          Publish a data asset that has been approved. The data asset must be in the correct state 
          (approved) before it can be published.
        </p>

        <ErrorBanner message={errorMsg} />

        <form className="form" onSubmit={onPublish}>
          <label className="field">
            <span className="field-label">
              Data Asset ID <span style={{ color: "red" }}>*</span>
            </span>
            <input
              className="input"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              placeholder="e.g., sub-12345"
            />
            <span className="help">The ID of the approved data asset to publish</span>
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Publishing…" : "Publish"}
          </button>
        </form>

        {result ? (
          <div className="result" style={{ marginTop: "1rem" }}>
            <h3>Publish Result</h3>
            <div className="field">
              <span className="field-label">Status</span>
              <span
                className={`ui-pill ${
                  result.status === "PUBLISHED" ? "ui-pill-success" : "ui-pill-error"
                }`}
              >
                {result.status}
              </span>
            </div>
            <pre className="codeblock">{JSON.stringify(result, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
