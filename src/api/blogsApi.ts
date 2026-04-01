import type { ApiBlogDocument, PostStatus } from '../types/Post';
import { apiFetch, getApiBase, parseErrorMessage } from './apiBase';

/** Path prefix for blog routes (no trailing slash). Default `/api/blogs`. Override if your server mounts elsewhere, e.g. `VITE_BLOGS_API_PATH=/api/v1/posts`. */
export function getBlogsApiPath(): string {
  const raw = import.meta.env.VITE_BLOGS_API_PATH;
  const s = typeof raw === 'string' && raw.trim() ? raw.trim() : '/api/blogs';
  const withSlash = s.startsWith('/') ? s : `/${s}`;
  return withSlash.replace(/\/$/, '') || '/api/blogs';
}

export async function fetchBlogsList(status?: PostStatus): Promise<ApiBlogDocument[]> {
  const base = getApiBase();
  const path = getBlogsApiPath();
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await apiFetch(`${base}${path}${q}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error('Invalid blogs response');
  return data as ApiBlogDocument[];
}

export async function fetchBlog(id: string): Promise<ApiBlogDocument> {
  const base = getApiBase();
  const path = getBlogsApiPath();
  const res = await apiFetch(`${base}${path}/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiBlogDocument;
}

export type CreateBlogBody = {
  title: string;
  summary?: string;
  content?: string;
  labels?: string[];
  coverImage?: string;
  timeToRead?: number;
  status?: PostStatus;
};

export async function createBlog(body: CreateBlogBody): Promise<ApiBlogDocument> {
  const base = getApiBase();
  const path = getBlogsApiPath();
  const res = await apiFetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiBlogDocument;
}

export async function patchBlog(id: string, body: Record<string, unknown>): Promise<ApiBlogDocument> {
  const base = getApiBase();
  const path = getBlogsApiPath();
  const res = await apiFetch(`${base}${path}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as ApiBlogDocument;
}

export async function deleteBlog(id: string): Promise<void> {
  const base = getApiBase();
  const path = getBlogsApiPath();
  const res = await apiFetch(`${base}${path}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) throw new Error(await parseErrorMessage(res));
}
