import type { ApiReviewDocument, ReviewState } from '../types/Review';
import { apiFetch, getApiBase, parseErrorMessage } from './apiBase';

export { getApiBase, getApiBaseForDisplay } from './apiBase';

export async function fetchReviewsList(state?: ReviewState): Promise<ApiReviewDocument[]> {
  const base = getApiBase();
  const q = state ? `?state=${encodeURIComponent(state)}` : '';
  const res = await apiFetch(`${base}/api/reviews${q}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error('Invalid reviews response');
  return data as ApiReviewDocument[];
}

export async function fetchReview(id: string): Promise<ApiReviewDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/reviews/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiReviewDocument;
}

export type CreateReviewBody = {
  name: string;
  role: string;
  serviceUsed: string;
  ratings: number;
  content: string;
  date?: string;
  state?: ReviewState;
};

export async function createReview(body: CreateReviewBody): Promise<ApiReviewDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiReviewDocument;
}

export async function patchReview(
  id: string,
  body: Record<string, unknown>,
): Promise<ApiReviewDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/reviews/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiReviewDocument;
}

export async function deleteReview(id: string): Promise<void> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) throw new Error(await parseErrorMessage(res));
}

export async function postReviewReply(id: string, body: string): Promise<ApiReviewDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/reviews/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiReviewDocument;
}

export async function patchReviewReply(id: string, body: string): Promise<ApiReviewDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/reviews/${encodeURIComponent(id)}/reply`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiReviewDocument;
}

export async function deleteReviewReply(id: string): Promise<ApiReviewDocument> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/reviews/${encodeURIComponent(id)}/reply`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiReviewDocument;
}
