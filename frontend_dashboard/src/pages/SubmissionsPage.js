import React, { useMemo, useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { submissionsApi } from "../api/endpoints";
import { trackSubmissionId } from "../utils/submissionStore";

// PUBLIC_INTERFACE
export function SubmissionsPage() {
  /** Create and track submissions via compatibility endpoint. */
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

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setCreated(null);

    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    if (!version.trim()) {
      setErrorMsg("Version is required.");
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
      setErrorMsg(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Submissions</h1>
      <p className="page-subtitle">Submit a data product package for pipeline processing.</p>

      <ErrorBanner message={errorMsg} />

      <div className="card">
        <h2 className="card-title">New submission</h2>

        <form className="form" onSubmit={onSubmit}>
          <div className="grid-2">
            <label className="field">
              <span className="field-label">Name</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <label className="field">
              <span className="field-label">Version</span>
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
            />
          </label>

          <label className="field">
            <span className="field-label">Artifact URIs (one per line)</span>
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
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>

      {created ? (
        <div className="card">
          <h2 className="card-title">Submission response</h2>
          <pre className="codeblock">{JSON.stringify(created, null, 2)}</pre>
          <div className="help">
            If a <code>submission_id</code> was returned, it has been saved locally and will appear in
            Dashboard.
          </div>
        </div>
      ) : null}
    </div>
  );
}
