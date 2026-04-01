export type CandidateStatus = 'waiting' | 'accepted' | 'rejected';

/** Backend (Mongo) candidate document shape returned by the REST API. */
export interface ApiCandidateDocument {
  _id: string;
  name: string;
  email: string;
  college: string;
  location: string;
  passoutYear: number;
  status: CandidateStatus;
  /** Stored filename on disk (may be null if missing) */
  resumeFileName?: string | null;
  /** Original upload name (shown to admins) */
  resumeOriginalName?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Frontend admin UI shape. `selectionMailSent` is tracked locally (not from API). */
export type Candidate = {
  id: string;
  name: string;
  email: string;
  college: string;
  location: string;
  passoutYear: number;
  status: CandidateStatus;
  resumeFileName: string | null;
  resumeOriginalName: string | null;
  createdAt: string;
  updatedAt: string;
  selectionMailSent: boolean;
};

export function mapApiCandidateToCandidate(doc: ApiCandidateDocument, selectionMailSent: boolean): Candidate {
  return {
    id: doc._id,
    name: doc.name ?? '',
    email: doc.email ?? '',
    college: doc.college ?? '',
    location: doc.location ?? '',
    passoutYear: typeof doc.passoutYear === 'number' && Number.isFinite(doc.passoutYear) ? doc.passoutYear : new Date().getFullYear(),
    status: doc.status ?? 'waiting',
    resumeFileName: doc.resumeFileName ?? null,
    resumeOriginalName: doc.resumeOriginalName ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    selectionMailSent,
  };
}
