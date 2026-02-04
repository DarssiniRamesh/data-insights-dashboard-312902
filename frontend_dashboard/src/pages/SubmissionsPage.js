/**
 * FR/NFR implementation summary (GxP traceability):
 * - FR-DPP-001: Provides a UI form that creates a data asset via legacy submissions compatibility endpoint (deprecated).
 * - NFR-DPP-020 (Automation support): Stores returned identifier locally for use in other workflow pages/tests.
 *
 * Note: This page is legacy/compat; new UI should prefer the standardized data asset endpoints directly.
 */
import React, { useMemo, useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { submissionsApi } from "../api/endpoints";
import { trackSubmissionId } from "../utils/submissionStore";

// PUBLIC_INTERFACE
export function SubmissionsPage() {
  /** 
   * Create and track data assets via deprecated compatibility endpoint.
   *
   * Compatibility: Uses legacy “submissions” endpoint (deprecated, use data asset).
   * Future implementations should use standardized data asset metadata (title, description, owner).
   */
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [description, setDescription] = useState("");

  const [domain, setDomain] = useState("gxp");
  const [gxp, setGxp] = useState(true);

  const [artifactLines, setArtifactLines] = useState("s3://bucket/path/file.csv");
  const artifacts = useMemo(() => {
    return artifactLines
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((uri) => ({ uri }));
  }, [artifactLines]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [created, setCreated] = useState(null);

  // FR-DPP-001 (REQ): UI-driven creation of a data asset. This page uses the legacy compat API, but the intent
  // is still “create with metadata” (title=name, description, owner=authenticated user in target-state).
  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setCreated(null);

    // Validation for standardized metadata fields
    if (!name.trim()) {
      setErrorMsg("Name is required (maps to 'title' in data asset metadata).");
      return;
    }
    if (name.trim().length > 200) {
      setErrorMsg("Name must be 200 characters or less.");
      return;
    }
    if (!version.trim()) {
      setErrorMsg("Version is required.");
      return;
    }
    if (description.trim().length > 2000) {
      setErrorMsg("Description must be 2000 characters or less.");
      return;
    }
    if (!artifacts.length) {
      setErrorMsg("Provide at least one artifact URI (one per line).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        version: version.trim(),
        description: description.trim(),
        artifacts,
        metadata: {
          domain: domain.trim(),
          gxp,
        },
      };

      const res = await submissionsApi.createCompat(payload);

      const submissionId =
        res?.submission_id || res?.id || res?.submissionId || res?.submissionID || null;

      if (submissionId) trackSubmissionId(submissionId);

      setCreated(res);
      setName("");
      setDescription("");
    } catch (err) {
      setErrorMsg(err.message || "Data asset submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Data Assets (Submissions)</h1>
      <p className="page-subtitle">
        Submit a data asset for processing. Data assets use standardized metadata: title (name), description, and owner.
      </p>

      <ErrorBanner message={errorMsg} />

      <div className="card">
        <h2 className="card-title">New Data Asset</h2>
        <p className="help" style={{ marginBottom: "1rem" }}>
          <strong>Note:</strong> This form uses the legacy compatibility endpoint. 
          Standard data asset metadata includes:
          <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li><strong>Title</strong>: Required, 1-200 characters (Name field below)</li>
            <li><strong>Description</strong>: Optional, max 2000 characters</li>
            <li><strong>Owner</strong>: Required, 1-120 characters (auto-set to current user)</li>
          </ul>
        </p>

        <form className="form" onSubmit={onSubmit}>
          <div className="grid-2">
            <label className="field">
              <span className="field-label">
                Title (Name) <span style={{ color: "red" }}>*</span>
              </span>
              <input 
                className="input" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
                placeholder="1-200 characters"
              />
              <span className="help">{name.length}/200 characters</span>
            </label>

            <label className="field">
              <span className="field-label">
                Version <span style={{ color: "red" }}>*</span>
              </span>
              <input
                className="input"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Optional, max 2000 characters"
            />
            <span className="help">{description.length}/2000 characters</span>
          </label>

          <label className="field">
            <span className="field-label">
              Artifact URIs (one per line) <span style={{ color: "red" }}>*</span>
            </span>
            <textarea
              className="textarea"
              value={artifactLines}
              onChange={(e) => setArtifactLines(e.target.value)}
              rows={4}
            />
          </label>

          <div className="grid-2">
            <label className="field">
              <span className="field-label">Domain</span>
              <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} />
            </label>

            <div className="field">
              <div className="field-label">GxP</div>
              <label className="checkbox">
                <input type="checkbox" checked={gxp} onChange={() => setGxp((v) => !v)} />
                <span>Domain is GxP regulated</span>
              </label>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Data Asset"}
          </button>
        </form>
      </div>

      {created ? (
        <div className="card">
          <h2 className="card-title">Data Asset Created</h2>
          <pre className="codeblock">{JSON.stringify(created, null, 2)}</pre>
          <div className="help">
            If a <code>submission_id</code> (or <code>data_asset_id</code>) was returned, it has been saved locally and will appear in
            Dashboard.
          </div>
        </div>
      ) : null}
    </div>
  );
}
