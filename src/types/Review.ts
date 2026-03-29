/**
 * Admin-only moderation shape. Full fields (name, role, service, review) stay in this panel;
 * your public site should only expose what you approve (often a subset).
 */
export type ReviewStatus = 'pending' | 'approved' | 'discarded';

export interface Review {
  id: string;
  name: string;
  rating: number;
  /** e.g. General Counsel, Founder, Individual client */
  role: string;
  /** Service or engagement the client is reviewing */
  serviceUsed: string;
  /** Full review text */
  review: string;
  /** Draft reply for your team; send via email or your workflow — stored here for reference */
  adminReply?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  /** Optional internal contact — not shown on the public testimonial wall */
  authorEmail?: string;
}
