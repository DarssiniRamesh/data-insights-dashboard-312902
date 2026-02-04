/**
 * FR/NFR implementation summary (GxP traceability):
 * - FR-DPP-001: dataAssetsApi.create() issues POST /api/v1/data-assets with standardized metadata.
 * - FR-DPP-002: dataAssetsApi.get() issues GET /api/v1/data-assets/{id} for UI/workflow visibility.
 * - NFR-DPP-009/NFR-DPP-010 (Identity/AuthZ): apiRequest attaches bearer token; backend enforces auth.
 * - NFR-DPP-002 (Auditability): buildAuditContext() provides client_request_id for correlation/audit linkage.
 */
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
export const dataAssetsApi = {
  /**
   * Create data asset with standardized metadata.
   * Contract: POST /api/v1/data-assets expects: draft_id, metadata {title, description, owner}, audit_context
   */
  // FR-DPP-001: Create data asset (title, description, owner)
  // FR-DPP-001 (REQ): Create a data asset by sending {draft_id, metadata:{title,description,owner}, audit_context}
  // to the backend; metadata constraints are enforced server-side and errors are surfaced to the UI.
  create: (draftId, metadata, currentUser) =>
    apiRequest("/api/v1/data-assets", {
      method: "POST",
      json: {
        draft_id: draftId,
        metadata: {
          title: metadata.title,
          description: metadata.description || null,
          owner: metadata.owner,
        },
        audit_context: buildAuditContext(currentUser),
      },
    }),

  /** Get a data asset via /api/v1/data-assets/{data_asset_id}. */
  // FR-DPP-002: Retrieve/list data assets
  // FR-DPP-002 (REQ): Retrieve a data asset (by ID) so the UI can render metadata/state and drive
  // validation/approval workflow actions.
  get: (dataAssetId) =>
    apiRequest(`/api/v1/data-assets/${encodeURIComponent(dataAssetId)}`, { method: "GET" }),

  /**
   * Trigger validation run via /api/v1/data-assets/{id}/validate.
   * Requires audit_context.
   */
  triggerValidation: (dataAssetId, { validation_profile }, currentUser) =>
    apiRequest(`/api/v1/data-assets/${encodeURIComponent(dataAssetId)}/validate`, {
      method: "POST",
      json: {
        validation_profile: validation_profile || "baseline",
        audit_context: buildAuditContext(currentUser),
      },
    }),

  /**
   * Approve or reject data asset via /api/v1/data-assets/{id}/approve.
   * Requires audit_context; supports password for e-sign reauth.
   */
  approve: (
    dataAssetId,
    { decision, rationale, password, signature_reason },
    currentUser
  ) =>
    apiRequest(`/api/v1/data-assets/${encodeURIComponent(dataAssetId)}/approve`, {
      method: "POST",
      json: {
        decision,
        rationale: rationale || null,
        password: password || null,
        audit_context: buildAuditContext(currentUser),
        signature: buildSignatureBlock(currentUser, signature_reason || "Approval action"),
      },
    }),
};

// PUBLIC_INTERFACE
export const submissionsApi = {
  /**
   * Create submission via compatibility endpoint (DEPRECATED).
   * Contract: POST /submissions expects simplified payload: name, version, description, artifacts, metadata.
   * 
   * Note: This endpoint is deprecated. Use dataAssetsApi.create() instead for new code.
   */
  createCompat: (payload) => apiRequest("/submissions", { method: "POST", json: payload }),

  /** Get a submission via /api/v1/submissions/{submission_id} (DEPRECATED). */
  get: (submissionId) =>
    apiRequest(`/api/v1/submissions/${encodeURIComponent(submissionId)}`, { method: "GET" }),

  /**
   * Trigger validation run via /api/v1/submissions/{id}/validate (DEPRECATED).
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
   * Run quality gates via compatibility endpoint (DEPRECATED).
   * POST /submissions/{id}/quality-gates/run
   */
  runQualityGatesCompat: (submissionId) =>
    apiRequest(`/submissions/${encodeURIComponent(submissionId)}/quality-gates/run`, {
      method: "POST",
    }),

  /**
   * Approve or reject submission via /api/v1/submissions/{id}/approve (DEPRECATED).
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
   * Compatibility approval endpoint (simplified) (DEPRECATED). Useful when backend is in compat-test mode.
   */
  approveCompat: (submissionId) =>
    apiRequest(`/submissions/${encodeURIComponent(submissionId)}/approve`, { method: "POST" }),

  /**
   * Publish via compatibility endpoint (DEPRECATED).
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
