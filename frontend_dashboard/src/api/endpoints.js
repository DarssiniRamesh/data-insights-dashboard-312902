import { apiRequest } from "./client";
import { buildAuditContext, buildSignatureBlock } from "../utils/audit";

// PUBLIC_INTERFACE
export const authApi = {
  /** Register a user via /api/v1/auth/register */
  register: (payload) => apiRequest("/api/v1/auth/register", { method: "POST", json: payload }),

  /** Login a user via /api/v1/auth/login */
  login: (payload) => apiRequest("/api/v1/auth/login", { method: "POST", json: payload }),

  /** Fetch current user profile via /api/v1/auth/me */
  me: () => apiRequest("/api/v1/auth/me", { method: "GET" }),
};

// PUBLIC_INTERFACE
export const healthApi = {
  /** Liveness probe (DB-independent). */
  health: () => apiRequest("/health", { method: "GET" }),
  /** Readiness probe (touches DB). */
  ready: () => apiRequest("/ready", { method: "GET" }),
};

// PUBLIC_INTERFACE
export const submissionsApi = {
  /**
   * Create submission via compatibility endpoint.
   * Contract: POST /submissions expects simplified payload: name, version, description, artifacts, metadata.
   */
  createCompat: (payload) => apiRequest("/submissions", { method: "POST", json: payload }),

  /** Get a submission via /api/v1/submissions/{submission_id}. */
  get: (submissionId) =>
    apiRequest(`/api/v1/submissions/${encodeURIComponent(submissionId)}`, { method: "GET" }),

  /**
   * Trigger validation run via /api/v1/submissions/{id}/validate.
   * Requires audit_context.
   */
  triggerValidation: (submissionId, { validation_profile }, currentUser) =>
    apiRequest(`/api/v1/submissions/${encodeURIComponent(submissionId)}/validate`, {
      method: "POST",
      json: {
        validation_profile: validation_profile || "baseline",
        audit_context: buildAuditContext(currentUser),
      },
    }),

  /**
   * Run quality gates via compatibility endpoint.
   * POST /submissions/{id}/quality-gates/run
   */
  runQualityGatesCompat: (submissionId) =>
    apiRequest(`/submissions/${encodeURIComponent(submissionId)}/quality-gates/run`, {
      method: "POST",
    }),

  /**
   * Approve or reject submission via /api/v1/submissions/{id}/approve.
   * Requires audit_context; supports password for e-sign reauth.
   */
  approve: (
    submissionId,
    { decision, rationale, password, signature_reason },
    currentUser
  ) =>
    apiRequest(`/api/v1/submissions/${encodeURIComponent(submissionId)}/approve`, {
      method: "POST",
      json: {
        decision,
        rationale: rationale || null,
        password: password || null,
        audit_context: buildAuditContext(currentUser),
        signature: buildSignatureBlock(currentUser, signature_reason || "Approval action"),
      },
    }),

  /**
   * Compatibility approval endpoint (simplified). Useful when backend is in compat-test mode.
   */
  approveCompat: (submissionId) =>
    apiRequest(`/submissions/${encodeURIComponent(submissionId)}/approve`, { method: "POST" }),

  /**
   * Publish via compatibility endpoint.
   * POST /submissions/{id}/publish
   */
  publishCompat: (submissionId) =>
    apiRequest(`/submissions/${encodeURIComponent(submissionId)}/publish`, { method: "POST" }),
};

// PUBLIC_INTERFACE
export const validationApi = {
  /** Retrieve validation report via /api/v1/validation-runs/{validation_run_id}. */
  getReport: (validationRunId) =>
    apiRequest(`/api/v1/validation-runs/${encodeURIComponent(validationRunId)}`, { method: "GET" }),
};

// PUBLIC_INTERFACE
export const auditApi = {
  /** Query audit events via /api/v1/audit/events?limit=... */
  queryEvents: ({ entity_type, entity_id, limit }) => {
    const params = new URLSearchParams();
    if (entity_type) params.set("entity_type", entity_type);
    if (entity_id) params.set("entity_id", entity_id);
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    return apiRequest(`/api/v1/audit/events${qs ? `?${qs}` : ""}`, { method: "GET" });
  },
};

// PUBLIC_INTERFACE
export const evidenceApi = {
  /** Get evidence package by id via /api/v1/evidence-packages/{evidence_package_id}. */
  getEvidencePackage: (evidencePackageId) =>
    apiRequest(`/api/v1/evidence-packages/${encodeURIComponent(evidencePackageId)}`, {
      method: "GET",
    }),
};
