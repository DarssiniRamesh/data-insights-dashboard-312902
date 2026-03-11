/**
 * Centralized fetch wrapper for the frontend dashboard.
 *
 * - Reads base URL from REACT_APP_API_BASE with a safe fallback.
 * - Attaches Authorization: Bearer <token> when present.
 * - Normalizes error shapes (FastAPI ErrorResponse and HTTPValidationError).
 * - On 401, clears auth and redirects to /login.
 */

const DEFAULT_API_BASE = "http://localhost:3001";
const PREVIEW_PROXY_API_BASE = "/proxy/3001";

/**
 * Decide which API base URL to use.
 *
 * Rules:
 * 1) If REACT_APP_API_BASE is set, always honor it (explicit override).
 * 2) In preview/proxied environments, default to the preview proxy path (/proxy/3001)
 *    so the browser doesn't call :3001 directly (avoids CORS/502 issues).
 * 3) Otherwise fall back to localhost:3001 for local dev.
 */
function getApiBase() {
  const explicit = process.env.REACT_APP_API_BASE;
  if (explicit && explicit.trim()) return explicit.trim().replace(/\/$/, "");

  // Preview domains typically run behind a reverse proxy that exposes backend ports
  // under /proxy/<port>. In that setup, calling :3001 directly fails.
  const host = window.location.hostname || "";
  const isPreviewDomain =
    host.includes("preview") ||
    host.includes("kavia") ||
    host.includes("kavia.ai") ||
    host.includes("onrender.com") ||
    host.includes("vercel.app") ||
    host.includes("netlify.app");

  if (isPreviewDomain) return PREVIEW_PROXY_API_BASE;

  return DEFAULT_API_BASE;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function formatFastApiError(payload) {
  // Supports:
  // 1) { error: { code, message, ... } }
  // 2) { detail: [{ loc, msg, type }, ...] } (HTTPValidationError)
  // 3) arbitrary JSON / text
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

// PUBLIC_INTERFACE
export async function apiRequest(path, options = {}) {
  /**
   * Perform a JSON request against the backend API.
   *
   * @param {string} path - API path, e.g. "/api/v1/auth/me" or "/health"
   * @param {object} options - fetch options plus optional { json } body shortcut
   * @returns {Promise<any>} parsed JSON response (or null for empty body)
   */
  const url = `${getApiBase()}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

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
    const err = new Error(formatFastApiError(payload) || `Request failed (${res.status}).`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
