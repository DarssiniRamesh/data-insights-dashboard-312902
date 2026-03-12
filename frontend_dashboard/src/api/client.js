/**
 * Centralized fetch wrapper for the frontend dashboard.
 *
 * - Resolves API base URL (same-origin proxy by default in preview).
 * - Attaches Authorization: Bearer <token> when present.
 * - Normalizes error shapes (FastAPI ErrorResponse and HTTPValidationError).
 * - On 401, clears auth and redirects to /login.
 */

/**
 * Proxy path used by the preview environment to reach the backend container (port 3001).
 * IMPORTANT: This is a same-origin path; it avoids direct http://host:3001 calls that
 * are not reachable from the browser in preview.
 */
const PREVIEW_PROXY_PATH = "/proxy/3001";

const DEFAULT_DEV_API_BASE = "http://localhost:3001";

/**
 * Normalize and resolve the API base URL.
 *
 * Contract:
 * - Inputs:
 *   - explicitBase?: string (usually process.env.REACT_APP_API_BASE)
 * - Output:
 *   - string (no trailing slash)
 * - Invariants:
 *   - If the returned value is a path (starts with "/"), it is same-origin.
 *   - Returned string never ends with "/".
 * - Errors:
 *   - None thrown; falls back deterministically.
 *
 * Resolution rules (ordered):
 * 1) If REACT_APP_API_BASE is set:
 *    - If it is a relative path (e.g. "/proxy/3001"), return as-is (normalized).
 *    - If it points to port 3001 (e.g. "http://localhost:3001" or "https://x:3001"),
 *      rewrite it to same-origin "/proxy/3001" to avoid preview breakage.
 *    - Otherwise, honor it as a full explicit override (useful for non-preview deployments).
 * 2) If not set:
 *    - In preview: use same-origin "/proxy/3001".
 *    - In local dev: use "http://localhost:3001".
 */
function resolveApiBase(explicitBase) {
  function stripTrailingSlash(raw) {
    return String(raw || "").trim().replace(/\/$/, "");
  }

  function isRelativeBase(raw) {
    return typeof raw === "string" && raw.trim().startsWith("/");
  }

  function pointsToBackendPort3001(raw) {
    if (!raw) return false;
    // Match ":3001" in an origin-like string; also matches ".../proxy/3001" but that is ok.
    return /:3001(\/|$)/.test(String(raw));
  }

  const normalizedExplicit = stripTrailingSlash(explicitBase);

  if (normalizedExplicit) {
    // Allow same-origin overrides explicitly.
    if (isRelativeBase(normalizedExplicit)) return normalizedExplicit;

    // If someone configured an explicit URL to :3001, prefer the preview-safe proxy.
    // This prevents ECONNREFUSED from preview domains where :3001 is not accessible.
    if (pointsToBackendPort3001(normalizedExplicit)) return PREVIEW_PROXY_PATH;

    return normalizedExplicit;
  }

  // Default behavior:
  // - Use preview proxy unless we're clearly on localhost (developer environment).
  const host = window.location.hostname || "";
  const isLocalhost = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  if (!isLocalhost) return PREVIEW_PROXY_PATH;

  return DEFAULT_DEV_API_BASE;
}

/**
 * Decide which API base URL to use (single canonical entrypoint).
 */
function getApiBase() {
  return resolveApiBase(process.env.REACT_APP_API_BASE);
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function formatFastApiError(payload) {
  if (!payload) return "Request failed.";

  if (payload.error && typeof payload.error === "object") {
    if (payload.error.message) return String(payload.error.message);
    return "Request failed.";
  }

  if (Array.isArray(payload.detail)) {
    const first = payload.detail[0];
    if (first?.msg) return String(first.msg);
    return "Validation failed.";
  }

  if (typeof payload.detail === "string") return payload.detail;

  return "Request failed.";
}

function getToken() {
  return localStorage.getItem("auth_token");
}

function clearAuthAndRedirect() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_profile");

  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

/**
 * PUBLIC_INTERFACE
 * Diagnostic helper to expose the currently resolved API base used by apiRequest().
 *
 * Contract:
 * - Inputs: none
 * - Output: string (same as internal getApiBase() result)
 * - Errors: none thrown
 * - Side effects: none
 */
export function getResolvedApiBaseForDiagnostics() {
  /** Returns the resolved API base currently used by the API client. */
  return getApiBase();
}

// PUBLIC_INTERFACE
export async function apiRequest(path, options = {}) {
  /**
   * Perform a JSON request against the backend API.
   *
   * @param {string} path - API path ("/api/v1/auth/me")
   * @param {object} options - fetch options plus optional { json } shortcut
   * @returns {Promise<any>}
   */

  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body = options.body;

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
  });

  const text = await res.text();
  const payload = text ? safeJsonParse(text) : null;

  if (res.status === 401) {
    clearAuthAndRedirect();

    const err = new Error("Authentication required. Please log in again.");
    err.status = 401;
    err.payload = payload;

    throw err;
  }

  if (!res.ok) {
    const err = new Error(
      formatFastApiError(payload) || `Request failed (${res.status}).`
    );

    err.status = res.status;
    err.payload = payload;

    throw err;
  }

  return payload;
}