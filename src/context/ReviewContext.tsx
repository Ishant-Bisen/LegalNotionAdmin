import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Review, ReviewStatus } from '../types/Review';

interface ReviewContextType {
  reviews: Review[];
  approveReview: (id: string) => void;
  discardReview: (id: string) => void;
  /** Move an approved review back to pending so it appears under Needs action again (not a permanent delete). */
  sendApprovedToNeedsAction: (id: string) => void;
  /** Move a discarded review back to pending (Needs action). */
  sendDiscardedToNeedsAction: (id: string) => void;
  /** Remove a discarded review from storage permanently. Only applies when status is discarded. */
  permanentlyDeleteDiscarded: (id: string) => void;
  setReviewReply: (id: string, reply: string) => void;
  /** For future: replace persist layer with fetch('/api/reviews') */
  refreshReviews: () => void;
}

const ReviewContext = createContext<ReviewContextType | null>(null);

const STORAGE_KEY = 'legalnotion_reviews';

/** Migrate older localStorage shapes (authorName, comment, projectTitle). */
function normalizeReview(raw: Record<string, unknown>): Review {
  const statusRaw = raw.status;
  const status: ReviewStatus =
    statusRaw === 'approved' || statusRaw === 'discarded' || statusRaw === 'pending' ? statusRaw : 'pending';

  const name =
    (typeof raw.name === 'string' && raw.name) ||
    (typeof raw.authorName === 'string' && raw.authorName) ||
    'Unknown';

  const review =
    (typeof raw.review === 'string' && raw.review) ||
    (typeof raw.comment === 'string' && raw.comment) ||
    '';

  const serviceUsed =
    (typeof raw.serviceUsed === 'string' && raw.serviceUsed) ||
    (typeof raw.projectTitle === 'string' && raw.projectTitle) ||
    '';

  const role = typeof raw.role === 'string' ? raw.role : '';

  const adminReply = typeof raw.adminReply === 'string' ? raw.adminReply : undefined;

  return {
    id: typeof raw.id === 'string' ? raw.id : uuidv4(),
    name,
    rating: typeof raw.rating === 'number' && raw.rating >= 1 && raw.rating <= 5 ? raw.rating : 5,
    role,
    serviceUsed,
    review,
    adminReply,
    status,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    authorEmail: typeof raw.authorEmail === 'string' ? raw.authorEmail : undefined,
  };
}

function loadReviews(): Review[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) {
      const parsed = JSON.parse(item) as unknown;
      if (!Array.isArray(parsed)) return sampleReviews();
      return parsed.map((r) => normalizeReview(r as Record<string, unknown>));
    }
  } catch {
    /* fall through */
  }
  return sampleReviews();
}

function saveReviews(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

/** Extra pending rows so “Needs action” pagination can be exercised (10+ items). */
function extraPendingReviews(): Review[] {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
  const rows: Omit<Review, 'id' | 'status' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Marcus Webb',
      authorEmail: 'marcus.w@example.com',
      rating: 5,
      role: 'Startup CEO',
      serviceUsed: 'Seed funding legal pack',
      review: 'Fast turnaround on SAFE notes and cap table cleanup. Exactly what we needed before our round.',
    },
    {
      name: 'Linda Park',
      authorEmail: 'linda.p@example.com',
      rating: 4,
      role: 'Compliance officer',
      serviceUsed: 'Regulatory filing review',
      review: 'Detailed memo on filing obligations. One follow-up call would have helped clarify the timeline.',
    },
    {
      name: 'Omar Farouk',
      authorEmail: 'omar.f@example.com',
      rating: 5,
      role: 'Nonprofit director',
      serviceUsed: '501(c)(3) application',
      review: 'Patient guidance through the exemption process. Our board felt supported the whole way.',
    },
    {
      name: 'Chloe Brennan',
      authorEmail: 'chloe.b@example.com',
      rating: 3,
      role: 'Product lead',
      serviceUsed: 'Terms of service draft',
      review: 'Solid draft; we asked for a few industry-specific tweaks and got them quickly.',
    },
    {
      name: 'Sanjay Patel',
      authorEmail: 'sanjay.p@example.com',
      rating: 5,
      role: 'CFO',
      serviceUsed: 'Debt restructuring',
      review: 'Clear options under pressure. Communication with our lenders improved after your involvement.',
    },
    {
      name: 'Hannah Osei',
      authorEmail: 'hannah.o@example.com',
      rating: 4,
      role: 'Home buyer',
      serviceUsed: 'Residential closing',
      review: 'Explained every document at signing. Made a stressful day much calmer.',
    },
    {
      name: 'Tomás Rivera',
      authorEmail: 'tomas.r@example.com',
      rating: 2,
      role: 'Contractor',
      serviceUsed: 'Payment dispute',
      review: 'Outcome was fine in the end but responses were slower than I hoped in week one.',
    },
    {
      name: 'Yuki Tanaka',
      authorEmail: 'yuki.t@example.com',
      rating: 5,
      role: 'Design studio owner',
      serviceUsed: 'Trademark registration',
      review: 'Handled USPTO office actions without us having to chase. Highly recommend.',
    },
    {
      name: 'Fatima Al-Rashid',
      authorEmail: 'fatima.a@example.com',
      rating: 5,
      role: 'Physician',
      serviceUsed: 'Practice partnership agreement',
      review: 'Balanced advice between clinical duties and business structure. Very thoughtful.',
    },
    {
      name: 'Greg Lowell',
      authorEmail: 'greg.l@example.com',
      rating: 4,
      role: 'Investor',
      serviceUsed: 'Due diligence support',
      review: 'Thorough red-flag memo on the target. Saved us from a bad deal.',
    },
    {
      name: 'Nina Kowalski',
      authorEmail: 'nina.k@example.com',
      rating: 5,
      role: 'Author',
      serviceUsed: 'Publishing contract review',
      review: 'Royalties and rights sections were explained in plain English. Huge relief.',
    },
    {
      name: 'Derek Mullins',
      authorEmail: 'derek.m@example.com',
      rating: 3,
      role: 'Landlord',
      serviceUsed: 'Eviction guidance',
      review: 'Process was explained well; court scheduling delays were outside anyone’s control.',
    },
  ];

  return rows.map((row, i) => ({
    ...row,
    id: uuidv4(),
    status: 'pending',
    createdAt: daysAgo(8 + i),
    updatedAt: daysAgo(8 + i),
  }));
}

function sampleReviews(): Review[] {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

  return [
    {
      id: uuidv4(),
      name: 'Sarah Mitchell',
      authorEmail: 'sarah.m@example.com',
      rating: 5,
      role: 'VP Operations',
      serviceUsed: 'Corporate merger advisory',
      review:
        'Outstanding counsel on our merger filing. Clear communication at every step and we always felt our interests were protected. Would recommend without hesitation.',
      status: 'pending',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv4(),
      name: 'James Okonkwo',
      authorEmail: 'j.okonkwo@example.com',
      rating: 4,
      role: 'HR Director',
      serviceUsed: 'Employment compliance',
      review:
        'Very thorough review of our employment contracts. Took a bit longer than expected but the detail was worth it.',
      status: 'pending',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv4(),
      name: 'Elena Vasquez',
      authorEmail: 'elena.v@example.com',
      rating: 5,
      role: 'Founder',
      serviceUsed: 'Intellectual property dispute',
      review:
        'The team made a stressful IP dispute manageable. We understood our options and achieved a strong settlement.',
      status: 'pending',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: uuidv4(),
      name: 'David Chen',
      authorEmail: 'd.chen@example.com',
      rating: 3,
      role: 'Litigation lead',
      serviceUsed: 'Civil litigation support',
      review:
        'Good advice overall. Would appreciate faster email responses during the discovery phase.',
      status: 'pending',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    ...extraPendingReviews(),
    {
      id: uuidv4(),
      name: 'Amira Hassan',
      authorEmail: 'amira.h@example.com',
      rating: 5,
      role: 'Individual client',
      serviceUsed: 'Estate planning',
      review:
        'Professional, empathetic, and incredibly sharp. They guided our family through estate planning with patience.',
      adminReply: 'Thank you for the thoughtful feedback — it was a privilege to support your family through this.',
      status: 'approved',
      createdAt: daysAgo(14),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv4(),
      name: 'Robert Klein',
      authorEmail: 'r.klein@example.com',
      rating: 5,
      role: 'Small business owner',
      serviceUsed: 'Business formation',
      review:
        'Best legal experience we have had as a small business. Transparent fees and practical guidance.',
      adminReply: 'We appreciate you trusting us with your formation work and are glad the process felt clear.',
      status: 'approved',
      createdAt: daysAgo(21),
      updatedAt: daysAgo(18),
    },
    {
      id: uuidv4(),
      name: 'Priya Nair',
      authorEmail: 'priya.n@example.com',
      rating: 4,
      role: 'Property manager',
      serviceUsed: 'Commercial lease',
      review:
        'Solid support on our real estate closing. Minor scheduling hiccup but resolved quickly.',
      status: 'approved',
      createdAt: daysAgo(30),
      updatedAt: daysAgo(25),
    },
    {
      id: uuidv4(),
      name: 'Anonymous submitter',
      authorEmail: 'spam@invalid.test',
      rating: 1,
      role: '—',
      serviceUsed: 'General inquiry',
      review: 'This appears to be automated promotional content with no real engagement.',
      status: 'discarded',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(6),
    },
  ];
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(loadReviews);

  const persist = useCallback((next: Review[]) => {
    setReviews(next);
    saveReviews(next);
  }, []);

  const approveReview = useCallback(
    (id: string) => {
      persist(
        reviews.map((r) =>
          r.id === id ? { ...r, status: 'approved' as const, updatedAt: new Date().toISOString() } : r,
        ),
      );
    },
    [reviews, persist],
  );

  const discardReview = useCallback(
    (id: string) => {
      persist(
        reviews.map((r) =>
          r.id === id ? { ...r, status: 'discarded' as const, updatedAt: new Date().toISOString() } : r,
        ),
      );
    },
    [reviews, persist],
  );

  const sendApprovedToNeedsAction = useCallback(
    (id: string) => {
      persist(
        reviews.map((r) =>
          r.id === id && r.status === 'approved'
            ? { ...r, status: 'pending' as const, updatedAt: new Date().toISOString() }
            : r,
        ),
      );
    },
    [reviews, persist],
  );

  const sendDiscardedToNeedsAction = useCallback(
    (id: string) => {
      persist(
        reviews.map((r) =>
          r.id === id && r.status === 'discarded'
            ? { ...r, status: 'pending' as const, updatedAt: new Date().toISOString() }
            : r,
        ),
      );
    },
    [reviews, persist],
  );

  const permanentlyDeleteDiscarded = useCallback(
    (id: string) => {
      const target = reviews.find((r) => r.id === id);
      if (!target || target.status !== 'discarded') return;
      persist(reviews.filter((r) => r.id !== id));
    },
    [reviews, persist],
  );

  const setReviewReply = useCallback(
    (id: string, reply: string) => {
      const trimmed = reply.trim();
      persist(
        reviews.map((r) =>
          r.id === id
            ? {
                ...r,
                adminReply: trimmed || undefined,
                updatedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
    },
    [reviews, persist],
  );

  const refreshReviews = useCallback(() => {
    setReviews(loadReviews());
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        approveReview,
        discardReview,
        sendApprovedToNeedsAction,
        sendDiscardedToNeedsAction,
        permanentlyDeleteDiscarded,
        setReviewReply,
        refreshReviews,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewProvider');
  return ctx;
}
