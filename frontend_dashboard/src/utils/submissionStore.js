const KEY = "tracked_submission_ids";

// PUBLIC_INTERFACE
export function getTrackedSubmissionIds() {
  /** Returns a list of data asset IDs tracked locally in this browser (legacy storage key name retained). */
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function trackSubmissionId(id) {
  /** Add a data asset ID to the local tracked list (deduped). (Legacy function name retained.) */
  if (!id) return;
  const existing = new Set(getTrackedSubmissionIds());
  existing.add(id);
  localStorage.setItem(KEY, JSON.stringify([...existing]));
}

// PUBLIC_INTERFACE
export function untrackSubmissionId(id) {
  /** Remove a data asset ID from local tracked list. (Legacy function name retained.) */
  const next = getTrackedSubmissionIds().filter((x) => x !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
}
