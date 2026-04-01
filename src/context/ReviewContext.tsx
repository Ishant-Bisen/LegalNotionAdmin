import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { mapApiReviewToReview, type Review } from '../types/Review';
import {
  fetchReviewsList,
  patchReview,
  deleteReview,
  postReviewReply,
  patchReviewReply,
  deleteReviewReply,
} from '../api/reviewsApi';

interface ReviewContextType {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  approveReview: (id: string) => Promise<void>;
  discardReview: (id: string) => Promise<void>;
  sendApprovedToNeedsAction: (id: string) => Promise<void>;
  sendDiscardedToNeedsAction: (id: string) => Promise<void>;
  permanentlyDeleteDiscarded: (id: string) => Promise<void>;
  setReviewReply: (id: string, reply: string) => Promise<void>;
  refreshReviews: (opts?: { silent?: boolean }) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listFetchGen = useRef(0);

  const refreshReviews = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    const gen = ++listFetchGen.current;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const docs = await fetchReviewsList();
      if (gen !== listFetchGen.current) return;
      setReviews(docs.map(mapApiReviewToReview));
      setError(null);
    } catch (e) {
      if (gen !== listFetchGen.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load reviews');
      setReviews([]);
    } finally {
      if (gen === listFetchGen.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshReviews();
  }, [refreshReviews]);

  const approveReview = useCallback(
    async (id: string) => {
      await patchReview(id, { state: 'approved' });
      await refreshReviews({ silent: true });
    },
    [refreshReviews],
  );

  const discardReview = useCallback(
    async (id: string) => {
      await patchReview(id, { state: 'discarded' });
      await refreshReviews({ silent: true });
    },
    [refreshReviews],
  );

  const sendApprovedToNeedsAction = useCallback(
    async (id: string) => {
      await patchReview(id, { state: 'needs_action' });
      await refreshReviews({ silent: true });
    },
    [refreshReviews],
  );

  const sendDiscardedToNeedsAction = useCallback(
    async (id: string) => {
      await patchReview(id, { state: 'needs_action' });
      await refreshReviews({ silent: true });
    },
    [refreshReviews],
  );

  const permanentlyDeleteDiscarded = useCallback(
    async (id: string) => {
      const target = reviews.find((r) => r.id === id);
      if (!target || target.status !== 'discarded') return;
      await deleteReview(id);
      await refreshReviews({ silent: true });
    },
    [reviews, refreshReviews],
  );

  const setReviewReply = useCallback(
    async (id: string, reply: string) => {
      const trimmed = reply.trim();
      const current = reviews.find((r) => r.id === id);
      const hadReply = Boolean((current?.adminReply ?? '').trim());

      if (!trimmed) {
        if (hadReply) await deleteReviewReply(id);
      } else if (hadReply) {
        await patchReviewReply(id, trimmed);
      } else {
        await postReviewReply(id, trimmed);
      }
      await refreshReviews({ silent: true });
    },
    [reviews, refreshReviews],
  );

  const value: ReviewContextType = {
    reviews,
    loading,
    error,
    approveReview,
    discardReview,
    sendApprovedToNeedsAction,
    sendDiscardedToNeedsAction,
    permanentlyDeleteDiscarded,
    setReviewReply,
    refreshReviews,
  };

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewProvider');
  return ctx;
}
