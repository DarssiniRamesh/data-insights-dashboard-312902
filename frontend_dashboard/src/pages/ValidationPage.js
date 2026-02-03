import React, { useState } from "react";
import { submissionsApi, validationApi } from "../api/endpoints";
import { ErrorBanner } from "../components/ErrorBanner";
import { useAuth } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
export function ValidationPage() {
  /** 
   * Validation page: trigger validation runs and view reports.
   * 
   * Terminology: 'data asset' (formerly 'submission')
   */
  const { currentUser } = useAuth();
  const [submissionId, setSubmissionId] = useState("");
  const [validationProfile, setValidationProfile] = useState("baseline");

  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState(null);
  const [triggerError, setTriggerError] = useState("");

  const [reportId, setReportId] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState("");

  // Also support quality gates compat endpoint
  const [qgSubmissionId, setQgSubmissionId] = useState("");
  const [qgLoading, setQgLoading] = useState(false);
  const [qgResult, setQgResult] = useState(null);
  const [qgError, setQgError] = useState("");

  async function onTriggerValidation(e) {
    e.preventDefault();
    setTriggerError("");
    setTriggerResult(null);

    if (!submissionId.trim()) {
      setTriggerError("Data asset ID is required.");
      return;
    }

    setTriggerLoading(true);
    try {
      const res = await submissionsApi.triggerValidation(
        submissionId.trim(),
        { validation_profile: validationProfile },
        currentUser
      );
      setTriggerResult(res);
    } catch (err) {
      setTriggerError(err.message || "Validation trigger failed.");
    } finally {
      setTriggerLoading(false);
    }
  }

  async function onGetReport(e) {
    e.preventDefault();
    setReportError("");
    setReport(null);

    if (!reportId.trim()) {
      setReportError("Validation run ID is required.");
      return;
    }

    setReportLoading(true);
    try {
      const res = await validationApi.getReport(reportId.trim());
      setReport(res);
    } catch (err) {
      setReportError(err.message || "Report fetch failed.");
    } finally {
      setReportLoading(false);
    }
  }

  async function onRunQualityGates(e) {
    e.preventDefault();
    setQgError("");
    setQgResult(null);

    if (!qgSubmissionId.trim()) {
      setQgError("Data asset ID is required.");
      return;
    }

    setQgLoading(true);
    try {
      const res = await submissionsApi.runQualityGatesCompat(qgSubmissionId.trim());
      setQgResult(res);
    } catch (err) {
      setQgError(err.message || "Quality gates failed.");
    } finally {
      setQgLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Validation</h1>
      <p className="page-subtitle">
        Trigger validation runs for data assets and view validation reports.
      </p>

      <div className="card">
        <h2 className="card-title">Trigger Validation</h2>
        <p className="help" style={{ marginBottom: "1rem" }}>
          Trigger a validation run for a data asset. Validation checks metadata completeness, 
          state validity, and schema compliance.
        </p>

        <ErrorBanner message={triggerError} />

        <form className="form" onSubmit={onTriggerValidation}>
          <label className="field">
            <span className="field-label">Data Asset ID (formerly Submission ID)</span>
            <input
              className="input"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              placeholder="e.g., sub-12345"
            />
          </label>

          <label className="field">
            <span className="field-label">Validation Profile</span>
            <select
              className="input"
              value={validationProfile}
              onChange={(e) => setValidationProfile(e.target.value)}
            >
              <option value="baseline">Baseline</option>
              <option value="strict">Strict</option>
            </select>
          </label>

          <button className="btn btn-primary" type="submit" disabled={triggerLoading}>
            {triggerLoading ? "Triggering…" : "Trigger Validation"}
          </button>
        </form>

        {triggerResult ? (
          <div className="result" style={{ marginTop: "1rem" }}>
            <h3>Validation Triggered</h3>
            <pre className="codeblock">{JSON.stringify(triggerResult, null, 2)}</pre>
          </div>
        ) : null}
      </div>

      <div className="card">
        <h2 className="card-title">Get Validation Report</h2>

        <ErrorBanner message={reportError} />

        <form className="form" onSubmit={onGetReport}>
          <label className="field">
            <span className="field-label">Validation Run ID</span>
            <input
              className="input"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              placeholder="e.g., val-67890"
            />
          </label>

          <button className="btn btn-primary" type="submit" disabled={reportLoading}>
            {reportLoading ? "Fetching…" : "Get Report"}
          </button>
        </form>

        {report ? (
          <div className="result" style={{ marginTop: "1rem" }}>
            <h3>Validation Report</h3>
            <div className="field">
              <span className="field-label">Overall Status</span>
              <span
                className={`ui-pill ${
                  report.overall_status === "pass" ? "ui-pill-success" : "ui-pill-error"
                }`}
              >
                {report.overall_status}
              </span>
            </div>
            <pre className="codeblock">{JSON.stringify(report, null, 2)}</pre>
          </div>
        ) : null}
      </div>

      <div className="card">
        <h2 className="card-title">Run Quality Gates (Compatibility Endpoint)</h2>
        <p className="help" style={{ marginBottom: "1rem" }}>
          Compatibility endpoint for running quality gates checks.
        </p>

        <ErrorBanner message={qgError} />

        <form className="form" onSubmit={onRunQualityGates}>
          <label className="field">
            <span className="field-label">Data Asset ID</span>
            <input
              className="input"
              value={qgSubmissionId}
              onChange={(e) => setQgSubmissionId(e.target.value)}
              placeholder="e.g., sub-12345"
            />
          </label>

          <button className="btn btn-primary" type="submit" disabled={qgLoading}>
            {qgLoading ? "Running…" : "Run Quality Gates"}
          </button>
        </form>

        {qgResult ? (
          <div className="result" style={{ marginTop: "1rem" }}>
            <h3>Quality Gates Result</h3>
            <pre className="codeblock">{JSON.stringify(qgResult, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
