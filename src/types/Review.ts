/**
 * Matches LegalNotion backend review `state` enum.
 */
export type ReviewState = 'needs_action' | 'approved' | 'discarded';

/** Raw document from GET/POST/PATCH /api/reviews */
export interface ApiReviewDocument {
  _id: string;
  name: string;
  role: string;
  serviceUsed: string;
  date?: string;
  ratings: number;
  state: ReviewState;
  content: string;
  reply?: { body: string; repliedAt?: string; updatedAt?: string };
  createdAt: string;
  updatedAt: string;
}

/**
 * Normalized shape for the admin UI (stable field names used across components).
 */
export interface Review {
  id: string;
  name: string;
  rating: number;
  role: string;
  serviceUsed: string;
  /** Client review text (API: `content`). */
  review: string;
  /** Team reply (API: `reply.body`). */
  adminReply?: string;
  status: ReviewState;
  createdAt: string;
  updatedAt: string;
  /** API `date` when present (display / sort fallback). */
  date?: string;
  authorEmail?: string;
}

export function mapApiReviewToReview(doc: ApiReviewDocument): Review {
  return {
    id: doc._id,
    name: doc.name,
    rating: typeof doc.ratings === 'number' ? doc.ratings : 5,
    role: doc.role ?? '',
    serviceUsed: doc.serviceUsed ?? '',
    review: doc.content ?? '',
    adminReply: doc.reply?.body?.trim() ? doc.reply.body : undefined,
    status: doc.state,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    date: doc.date,
  };
}
