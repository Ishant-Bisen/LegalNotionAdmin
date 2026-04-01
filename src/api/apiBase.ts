import { getStoredAdminBearerToken } from './authSession';

function normalizeBase(raw: string): string {
  return raw.replace(/\/$/, '');
}

export const DEFAULT_API_BASE = 'https://api.legalnotion.in';

/**
 * API origin (no trailing slash). Defaults to deployed Render API in all modes.
 */
export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE;
  const explicit = typeof fromEnv === 'string' && fromEnv.trim().length > 0;
  if (explicit) return normalizeBase(fromEnv.trim());
  return normalizeBase(DEFAULT_API_BASE);
}

export function getApiBaseForDisplay(): string {
  return getApiBase();
}

function requestUrlString(input: string | URL): string {
  return typeof input === 'string' ? input : input.href;
}

/** Credentialed fetch + Bearer when JWT is stored (LegalNotionBackend: cookie `ln_admin_token` + body `token`). */
export function apiFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const url = requestUrlString(input);
  const skipBearer = url.includes('/api/auth/login');
  const headers = new Headers(init?.headers ?? undefined);
  if (!skipBearer) {
    const token = getStoredAdminBearerToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers,
    cache: init?.cache ?? 'no-store',
  });
}

function shortHtmlError(res: Response, text: string): string {
  if (/cloudflare|cf-error|worker threw exception/i.test(text)) {
    const ray = text.match(/Ray ID:\s*([a-f0-9]+)/i)?.[1];
    return `Edge/proxy returned HTML (${res.status})${ray ? ` · Ray ${ray}` : ''}. Check API/Worker logs.`;
  }
  return `Server returned HTML instead of JSON (${res.status}).`;
}

export async function parseErrorMessage(res: Response): Promise<string> {
  const contentType = (res.headers.get('content-type') ?? '').toLowerCase();
  const text = await res.text();
  const looksHtml =
    contentType.includes('text/html') || /^\s*</.test(text) || text.toLowerCase().includes('<!doctype html');

  if (looksHtml) {
    return shortHtmlError(res, text);
  }

  try {
    const data = JSON.parse(text) as { error?: string; message?: string };
    if (typeof data.error === 'string' && data.error) return data.error;
    if (typeof data.message === 'string' && data.message) return data.message;
  } catch {
    const pre = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (pre?.[1]?.trim()) return pre[1].trim();
  }
  const trimmed = text.trim();
  if (trimmed && trimmed.length < 500 && !trimmed.toLowerCase().includes('<html')) return trimmed;
  if (res.status === 404) {
    return 'Not found (404).';
  }
  return res.statusText || `Request failed (${res.status})`;
}
