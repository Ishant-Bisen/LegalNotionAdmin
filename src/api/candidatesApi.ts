import type { ApiCandidateDocument, CandidateStatus } from '../types/Candidate';
import { apiFetch, getApiBase, parseErrorMessage } from './apiBase';

function normalizeBasePath(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '/api/candidates';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/$/, '');
}

export function getCandidatesApiPath(): string {
  const raw = import.meta.env.VITE_CANDIDATES_API_PATH;
  return normalizeBasePath(typeof raw === 'string' ? raw : '/api/candidates');
}

export function getCandidateResumeUrl(id: string): string {
  const base = getApiBase();
  return `${base}${getCandidatesApiPath()}/${encodeURIComponent(id)}/resume`;
}

export async function submitCandidate(fd: FormData): Promise<ApiCandidateDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}${getCandidatesApiPath()}`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiCandidateDocument;
}

export async function fetchCandidatesList(status?: CandidateStatus): Promise<ApiCandidateDocument[]> {
  const base = getApiBase();
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await apiFetch(`${base}${getCandidatesApiPath()}${q}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error('Invalid candidates response');
  return data as ApiCandidateDocument[];
}

export async function fetchCandidate(id: string): Promise<ApiCandidateDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}${getCandidatesApiPath()}/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiCandidateDocument;
}

export async function patchCandidate(
  id: string,
  body: Partial<Pick<ApiCandidateDocument, 'name' | 'email' | 'college' | 'location' | 'passoutYear' | 'status'>>,
): Promise<ApiCandidateDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}${getCandidatesApiPath()}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiCandidateDocument;
}

export async function deleteCandidate(id: string): Promise<void> {
  const base = getApiBase();
  const res = await apiFetch(`${base}${getCandidatesApiPath()}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) throw new Error(await parseErrorMessage(res));
}

export async function patchCandidateResume(id: string, fd: FormData): Promise<ApiCandidateDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}${getCandidatesApiPath()}/${encodeURIComponent(id)}/resume`, {
    method: 'PATCH',
    body: fd,
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiCandidateDocument;
}

