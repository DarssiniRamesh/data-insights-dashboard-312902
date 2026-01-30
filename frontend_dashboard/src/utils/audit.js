import { uuidv4 } from "./ids";

function nowUtcIso() {
  return new Date().toISOString();
}

function pickActorRole(profile) {
  const roles = profile?.roles || [];
  // Prefer explicit governance/audit roles if present; otherwise first role.
  if (roles.includes("governance_admin")) return "governance_admin";
  if (roles.includes("auditor")) return "auditor";
  if (roles.includes("steward")) return "steward";
  if (roles.includes("publisher")) return "publisher";
  return roles[0] || "system";
}

// PUBLIC_INTERFACE
export function buildAuditContext(profile) {
  /** Create the AuditContext required by several /api/v1 endpoints. */
  return {
    actor_user_id: profile?.user_id || "unknown",
    actor_role: pickActorRole(profile),
    timestamp_utc: nowUtcIso(),
    client_request_id: uuidv4(),
  };
}

function pickSignerRole(profile) {
  // SignatureBlock signer_role enum: steward | governance_admin | quality_owner
  const roles = profile?.roles || [];
  if (roles.includes("governance_admin")) return "governance_admin";
  if (roles.includes("steward")) return "steward";
  // Fall back to quality_owner if user is otherwise authorized by server policy.
  return "quality_owner";
}

// PUBLIC_INTERFACE
export function buildSignatureBlock(profile, signatureReason) {
  /** Build a SignatureBlock; password reauth is supplied separately in request body. */
  return {
    signer_user_id: profile?.user_id || "unknown",
    signer_role: pickSignerRole(profile),
    signed_at_utc: nowUtcIso(),
    reauthentication_method: "password",
    signature_reason: signatureReason || "Approval",
    signature_hash: null,
  };
}
