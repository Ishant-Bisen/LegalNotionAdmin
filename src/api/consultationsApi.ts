import type { ApiConsultationDocument } from '../types/Consultation';
import { apiFetch, getApiBase, parseErrorMessage } from './apiBase';

export async function fetchConsultationsList(): Promise<ApiConsultationDocument[]> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/consultations`, { method: 'GET' });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error('Invalid consultations response');
  return data as ApiConsultationDocument[];
}

export async function deleteConsultation(id: string): Promise<void> {
  const base = getApiBase();
  const res = await apiFetch(`${base}/api/consultations/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) throw new Error(await parseErrorMessage(res));
}
