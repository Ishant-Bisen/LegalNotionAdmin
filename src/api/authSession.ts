/**
 * Backend sets httpOnly cookie `ln_admin_token` and returns the same JWT in `token` on login.
 * We persist the JWT here so refresh / new tabs still send `Authorization: Bearer` when the cookie
 * is missing (cross-origin) or as a consistent second factor. Cleared on logout and 401.
 */
const STORAGE_KEY = 'ln_admin_token_client';
const LEGACY_SESSION_KEY = 'ln_admin_bearer_token';

export function getStoredAdminBearerToken(): string | null {
  try {
    let v = localStorage.getItem(STORAGE_KEY);
    if (!v?.trim()) {
      const legacy = sessionStorage.getItem(LEGACY_SESSION_KEY);
      if (legacy?.trim()) {
        sessionStorage.removeItem(LEGACY_SESSION_KEY);
        localStorage.setItem(STORAGE_KEY, legacy.trim());
        v = legacy.trim();
      }
    }
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

export function setStoredAdminBearerToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token.trim());
  } catch {
    /* quota / private mode */
  }
}

export function clearStoredAdminBearerToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
