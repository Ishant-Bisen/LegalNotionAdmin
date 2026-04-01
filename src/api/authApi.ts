import { apiFetch, getApiBase, parseErrorMessage } from './apiBase';
import { clearStoredAdminBearerToken, setStoredAdminBearerToken } from './authSession';

export type AuthLoginBody = { email: string; password: string };

export type AuthAdminResponse = {
  admin: {
    id: string;
    email: string;
  };
};

/** LegalNotionBackend: `POST /api/auth/login` → `{ admin, token }` + `Set-Cookie: ln_admin_token`. */
type AuthLoginPayload = AuthAdminResponse & {
  token?: string;
  accessToken?: string;
};

function pickTokenFromLoginPayload(data: AuthLoginPayload): string | null {
  const a = data.token;
  const b = data.accessToken;
  if (typeof a === 'string' && a.trim()) return a.trim();
  if (typeof b === 'string' && b.trim()) return b.trim();
  return null;
}

export async function loginAdmin(body: AuthLoginBody): Promise<AuthAdminResponse> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = (await res.json()) as AuthLoginPayload;
  const token = pickTokenFromLoginPayload(data);
  if (token) setStoredAdminBearerToken(token);
  else clearStoredAdminBearerToken();
  return { admin: data.admin };
}

/**
 * `null` = not authenticated. `undefined` = could not verify (network/5xx) — do not clear existing UI session.
 */
export async function getMe(): Promise<AuthAdminResponse['admin'] | null | undefined> {
  const base = getApiBase();
  let res: Response;
  try {
    res = await apiFetch(`${base}/api/auth/me`, { method: 'GET' });
  } catch {
    return undefined;
  }
  if (res.status === 401 || res.status === 403) {
    clearStoredAdminBearerToken();
    return null;
  }
  if (!res.ok) return undefined;
  try {
    const data = (await res.json()) as AuthAdminResponse;
    return data.admin;
  } catch {
    return undefined;
  }
}

export async function logoutAdmin(): Promise<void> {
  const base = getApiBase();
  try {
    const res = await apiFetch(`${base}/api/auth/logout`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
  } finally {
    clearStoredAdminBearerToken();
  }
}

