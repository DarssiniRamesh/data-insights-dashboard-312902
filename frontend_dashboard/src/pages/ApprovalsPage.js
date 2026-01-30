import React, { useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingPill } from "../components/LoadingPill";
import { submissionsApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function ApprovalsPage() {
  /** Approve/reject submissions (SoD + e-sign enforced by backend). */
  const { profile } = useAuth();

  const [submissionId, setSubmissionId] = useState("");
  const [decision, setDecision] = useState("publish"); // publish|reject
  const [rationale, setRationale] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  async function onApprove() {
    setErrorMsg("");
    setResult(null);

    if (!submissionId.trim()) {
      setErrorMsg("Enter a submission ID.");
      return;
    }
    if (!password) {
      setErrorMsg("Password re-entry is required for electronic signature.");
      return;
    }

    setLoading(true);
    try {
      const res = await submissionsApi.approve(
        submissionId.trim(),
        {
          decision,
          rationale,
          password,
          signature_reason: decision === "publish" ? "Approve for publishing" : "Reject submission",
        },
        profile
      );
      setResult(res);
      setPassword("");
      setRationale("");
    } catch (err) {
      // 403 is typical for SoD violation; show message.
      setErrorMsg(err.message || "Approval failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Approvals</h1>
      <p className="page-subtitle">
        Approve or reject submissions with electronic signature and segregation of duties.
      </p>

      <ErrorBanner message={errorMsg} />

      <div className="card">
        <h2 className="card-title">Approval action</h2>

        <div className="grid-2">
          <label className="field">
            <span className="field-label">Submission ID</span>
            <input
              className="input"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">Decision</span>
            <select className="select" value={decision} onChange={(e) => setDecision(e.target.value)}>
              <option value="publish">Approve (publish)</option>
              <option value="reject">Reject</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field-label">Rationale (optional)</span>
          <textarea
            className="textarea"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={3}
          />
        </label>

        <label className="field">
          <span className="field-label">Password (e-sign re-auth)</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div className="help">
            Backend validates e-sign and SoD. A 403 error typically indicates a SoD violation or
            insufficient role.
          </div>
        </label>

        <div className="button-row">
          <button className="btn btn-primary" type="button" onClick={onApprove} disabled={loading}>
            Submit e-sign approval
          </button>
        </div>

        {loading ? <LoadingPill /> : null}
      </div>

      {result ? (
        <div className="card">
          <h2 className="card-title">Result</h2>
          <pre className="codeblock">{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
