import React, { useState } from "react";
import { submissionsApi } from "../api/endpoints";
import { ErrorBanner } from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function ApprovalsPage() {
  /**
   * Approvals page: approve or reject data assets with e-signature.
   * 
   * Terminology: 'data asset' (formerly 'submission')
   * Enforces Segregation of Duties (SoD): approver cannot be submitter.
   */
  const { profile } = useAuth();
  const currentUser = profile;
  const [submissionId, setSubmissionId] = useState("");
  const [decision, setDecision] = useState("publish");
  const [rationale, setRationale] = useState("");
  const [password, setPassword] = useState("");
  const [signatureReason, setSignatureReason] = useState("Approval decision");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);

    if (!submissionId.trim()) {
      setErrorMsg("Data asset ID is required.");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Password is required for electronic signature.");
      return;
    }

    setLoading(true);
    try {
      const res = await submissionsApi.approve(
        submissionId.trim(),
        {
          decision,
          rationale: rationale.trim() || null,
          password: password.trim(),
          signature_reason: signatureReason.trim(),
        },
        currentUser
      );
      setResult(res);
      setPassword(""); // Clear password after use
    } catch (err) {
      setErrorMsg(err.message || "Approval failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Approvals</h1>
      <p className="page-subtitle">
        Approve or reject data assets with electronic signature and Segregation of Duties enforcement.
      </p>

      <div className="card">
        <h2 className="card-title">Approval Decision</h2>
        <p className="help" style={{ marginBottom: "1rem" }}>
          <strong>Segregation of Duties (SoD):</strong> You cannot approve data assets that you submitted. 
          The system will enforce this rule and reject self-approvals.
        </p>

        <ErrorBanner message={errorMsg} />

        <form className="form" onSubmit={onSubmit}>
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
            <span className="help">The ID of the data asset to approve or reject</span>
          </label>

          <label className="field">
            <span className="field-label">Decision</span>
            <select className="input" value={decision} onChange={(e) => setDecision(e.target.value)}>
              <option value="publish">Approve (Publish)</option>
              <option value="reject">Reject</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Rationale</span>
            <textarea
              className="textarea"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              placeholder="Optional: reason for approval or rejection"
            />
          </label>

          <label className="field">
            <span className="field-label">
              Password (for e-signature) <span style={{ color: "red" }}>*</span>
            </span>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
            <span className="help">
              Required for electronic signature verification (21 CFR Part 11 aligned)
            </span>
          </label>

          <label className="field">
            <span className="field-label">Signature Reason</span>
            <input
              className="input"
              value={signatureReason}
              onChange={(e) => setSignatureReason(e.target.value)}
            />
            <span className="help">Reason for applying electronic signature</span>
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Processing…" : decision === "publish" ? "Approve & Publish" : "Reject"}
          </button>
        </form>

        {result ? (
          <div className="result" style={{ marginTop: "1rem" }}>
            <h3>Approval Result</h3>
            <pre className="codeblock">{JSON.stringify(result, null, 2)}</pre>
            {result.evidence_package_id ? (
              <div className="help" style={{ marginTop: "0.5rem" }}>
                Evidence package created: <code>{result.evidence_package_id}</code>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
