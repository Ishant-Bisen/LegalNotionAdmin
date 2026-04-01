import { apiFetch, getApiBase, parseErrorMessage } from './apiBase';

export type HealthResponse = {
  status: string;
  [key: string]: unknown;
};

export async function fetchHealth(): Promise<HealthResponse> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/health`, { method: 'GET' });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as HealthResponse;
}
