/**
 * Centralized fetch wrapper for the frontend dashboard.
 *
 * - Reads base URL from REACT_APP_API_BASE with a safe fallback.
 * - Attaches Authorization: Bearer <token> when present.
 * - Normalizes error shapes (FastAPI ErrorResponse and HTTPValidationError).
 * - On 401, clears auth and redirects to /login.
 */

const DEFAULT_API_BASE = "http://localhost:3001";
const PREVIEW_PROXY_PATH = "/proxy/3001";

/**
 * Decide which API base URL to use.
 *
 * Rules:
 * 1) If REACT_APP_API_BASE is set, always honor it.
 * 2) In preview environments, use the proxy path without the dev port.
 * 3) Otherwise fall back to localhost:3001.
 */
function getApiBase() {
  const explicit = process.env.REACT_APP_API_BASE;

  function normalizeBase(raw) {
    if (!raw) return "";
    const trimmed = String(raw).trim().replace(/\/$/, "");

    if (!trimmed) return "";

    // If someone passed a proxy path
    if (trimmed.includes("/proxy/3001")) {
      return `${window.location.origin.replace(/:\d+$/, "")}${PREVIEW_PROXY_PATH}`;
    }

    return trimmed;
  }

  if (explicit && explicit.trim()) {
    return normalizeBase(explicit);
  }

  const host = window.location.hostname || "";

  const isPreviewDomain =
    host.includes("preview") ||
    host.includes("kavia") ||
    host.includes("kavia.ai") ||
    host.includes("onrender.com") ||
    host.includes("vercel.app") ||
    host.includes("netlify.app");

  if (isPreviewDomain) {
    return `${window.location.origin.replace(/:\d+$/, "")}${PREVIEW_PROXY_PATH}`;
  }

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