import React, { useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingPill } from "../components/LoadingPill";
import { submissionsApi, validationApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function ValidationPage() {
  /** Validation & quality gates actions per submission. */
  const { profile } = useAuth();

  const [submissionId, setSubmissionId] = useState("");
  const [validationProfile, setValidationProfile] = useState("baseline");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [submission, setSubmission] = useState(null);
  const [validationTrigger, setValidationTrigger] = useState(null);
  const [qualityGateResult, setQualityGateResult] = useState(null);

  const [report, setReport] = useState(null);

  async function loadSubmission() {
    setErrorMsg("");
    setReport(null);
    setValidationTrigger(null);
    setQualityGateResult(null);

    if (!submissionId.trim()) {
      setErrorMsg("Enter a submission ID.");
      return;
    }

    setLoading(true);
    try {
      const s = await submissionsApi.get(submissionId.trim());
      setSubmission(s);

      if (s.latest_validation_run_id) {
        const rep = await validationApi.getReport(s.latest_validation_run_id);
        setReport(rep);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to load submission.");
    } finally {
      setLoading(false);
    }
  }

  async function triggerValidation() {
    setErrorMsg("");
    setValidationTrigger(null);
    setReport(null);

    if (!submissionId.trim()) {
      setErrorMsg("Enter a submission ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await submissionsApi.triggerValidation(
        submissionId.trim(),
        { validation_profile: validationProfile },
        profile
      );
      setValidationTrigger(res);

      // Re-fetch submission to learn latest_validation_run_id (when available).
      const s = await submissionsApi.get(submissionId.trim());
      setSubmission(s);

      if (s.latest_validation_run_id) {
        const rep = await validationApi.getReport(s.latest_validation_run_id);
        setReport(rep);
      }
    } catch (err) {
      setErrorMsg(err.message || "Validation trigger failed.");
    } finally {
      setLoading(false);
    }
  }

  async function runQualityGatesCompat() {
    setErrorMsg("");
    setQualityGateResult(null);

    if (!submissionId.trim()) {
      setErrorMsg("Enter a submission ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await submissionsApi.runQualityGatesCompat(submissionId.trim());
      setQualityGateResult(res);
    } catch (err) {
      // Compat endpoints may return deterministic failures; we surface message.
      setErrorMsg(err.message || "Quality gates run failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Validation</h1>
      <p className="page-subtitle">Trigger validation and quality gates, view pass/fail details.</p>

      <ErrorBanner message={errorMsg} />

      <div className="card">
        <h2 className="card-title">Select submission</h2>

        <div className="grid-3">
          <label className="field">
            <span className="field-label">Submission ID</span>
            <input
              className="input"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            />
          </label>

          <label className="field">
            <span className="field-label">Validation profile</span>
            <input
              className="input"
              value={validationProfile}
              onChange={(e) => setValidationProfile(e.target.value)}
              placeholder="baseline"
            />
          </label>

          <div className="field">
            <span className="field-label">Actions</span>
            <div className="button-row">
              <button className="btn btn-secondary" type="button" onClick={loadSubmission}>
                Load
              </button>
              <button className="btn btn-primary" type="button" onClick={triggerValidation}>
                Trigger validation
              </button>
              <button className="btn btn-secondary" type="button" onClick={runQualityGatesCompat}>
                Run quality gates (compat)
              </button>
            </div>
          </div>
        </div>

        {loading ? <LoadingPill /> : null}
      </div>

      {submission ? (
        <div className="card">
          <h2 className="card-title">Submission</h2>
          <pre className="codeblock">{JSON.stringify(submission, null, 2)}</pre>
        </div>
      ) : null}

      {validationTrigger ? (
        <div className="card">
          <h2 className="card-title">Validation trigger response</h2>
          <pre className="codeblock">{JSON.stringify(validationTrigger, null, 2)}</pre>
        </div>
      ) : null}

      {qualityGateResult ? (
        <div className="card">
          <h2 className="card-title">Quality gates (compat) result</h2>
          <pre className="codeblock">{JSON.stringify(qualityGateResult, null, 2)}</pre>
          <div className="help">
            Compat contract: may return 200/409 depending on state; errors are displayed above.
          </div>
        </div>
      ) : null}

      {report ? (
        <div className="card">
          <h2 className="card-title">
            Validation report:{" "}
            <span
              className={`ui-pill ${
                report.overall_status === "pass" ? "ui-pill-success" : "ui-pill-error"
              }`}
            >
              {report.overall_status}
            </span>
          </h2>
          <div className="help mono">Validation run: {report.validation_run_id}</div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Status</th>
                  <th>Metrics / Findings</th>
                </tr>
              </thead>
              <tbody>
                {(report.checks || []).map((c) => (
                  <tr key={c.check_name}>
                    <td>{c.check_name}</td>
                    <td>
                      <span
                        className={`ui-pill ${
                          c.status === "pass" ? "ui-pill-success" : "ui-pill-error"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="mini-json">
                        <div className="help">metrics</div>
                        <pre className="codeblock codeblock-small">
                          {JSON.stringify(c.metrics || {}, null, 2)}
                        </pre>
                        <div className="help">findings</div>
                        <pre className="codeblock codeblock-small">
                          {JSON.stringify(c.findings || [], null, 2)}
                        </pre>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
