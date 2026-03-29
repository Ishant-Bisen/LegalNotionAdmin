import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Post } from '../types/Post';
import { sortPostsByRecent } from '../utils/sortPosts';

interface PostContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => Post;
  updatePost: (id: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>) => void;
  deletePost: (id: string) => void;
  getPost: (id: string) => Post | undefined;
  availableTags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}

const PostContext = createContext<PostContextType | null>(null);

const STORAGE_KEY = 'legalnotion_posts';
const TAGS_STORAGE_KEY = 'legalnotion_tags';

const DEFAULT_TAGS = [
  'Contract Law',
  'Legal Basics',
  'IP Law',
  'Technology',
  'Employment Law',
  'Updates',
  'Corporate Law',
  'Criminal Law',
  'Family Law',
  'Tax Law',
  'Real Estate',
  'Immigration',
  'Constitutional Law',
  'Human Rights',
  'Cyber Law',
];

function loadTags(): string[] {
  try {
    const raw = localStorage.getItem(TAGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_TAGS;
  } catch {
    return DEFAULT_TAGS;
  }
}

function persistTags(tags: string[]) {
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
}

function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return samplePosts();
    const parsed = JSON.parse(raw) as Post[];
    const now = new Date().toISOString();
    return parsed.map((p) => {
      const createdAt = typeof p.createdAt === 'string' ? p.createdAt : now;
      const updatedAt = typeof p.updatedAt === 'string' ? p.updatedAt : createdAt;
      return {
        ...p,
        summary: typeof p.summary === 'string' ? p.summary : '',
        createdAt,
        updatedAt,
      };
    });
  } catch {
    return samplePosts();
  }
}

function savePosts(posts: Post[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function samplePosts(): Post[] {
  const now = new Date().toISOString();
  const seeds: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: 'Understanding Contract Law Basics',
      summary:
        'A quick guide to what makes a contract valid, why it matters in everyday life, and the core ideas every reader should know before signing.',
      content:
        '<p>Contract law governs legally binding agreements between parties. A valid contract typically requires an offer, acceptance, consideration, and mutual assent.</p>',
      labels: ['Contract Law', 'Legal Basics'],
      coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
      timeToRead: 5,
      status: 'published',
    },
    {
      title: 'Intellectual Property Rights in the Digital Age',
      summary:
        'How IP works online, what creators should watch for, and practical ways to protect software, content, and brands in 2026.',
      content:
        '<p>Digital transformation has fundamentally changed how intellectual property is created, shared, and protected.</p>',
      labels: ['IP Law', 'Technology'],
      coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      timeToRead: 8,
      status: 'published',
    },
    {
      title: 'Draft: Employment Law Updates 2026',
      summary: 'Outline of expected changes to employment rules, remote work, and worker protections for the year ahead.',
      content: '<p>This draft covers the latest employment law changes expected in 2026.</p>',
      labels: ['Employment Law', 'Updates'],
      coverImage: '',
      timeToRead: 6,
      status: 'draft',
    },
    {
      title: 'Data Privacy Checklist for Small Teams',
      summary: 'A practical checklist for policies, vendors, and breach response without drowning in jargon.',
      content: '<p>Privacy programs start with inventory, contracts, and training. This checklist walks through the essentials.</p>',
      labels: ['Cyber Law', 'Technology'],
      coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
      timeToRead: 7,
      status: 'published',
    },
    {
      title: 'When Do You Need a Trademark Search?',
      summary: 'Before you launch a name or logo, here is how searches reduce conflict risk and save rework later.',
      content: '<p>Clearance searches compare your mark to existing filings and common-law use.</p>',
      labels: ['IP Law', 'Corporate Law'],
      coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
      timeToRead: 6,
      status: 'published',
    },
    {
      title: 'Draft: Family Law Mediation Explained',
      summary: 'How mediation differs from litigation and what to expect in the first session.',
      content: '<p>Mediation is confidential and party-driven; the mediator does not decide the outcome.</p>',
      labels: ['Family Law', 'Legal Basics'],
      coverImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
      timeToRead: 5,
      status: 'draft',
    },
    {
      title: 'Commercial Lease Clauses Worth Negotiating',
      summary: 'Rent steps, TI allowances, and exit rights — the clauses that most often matter for tenants.',
      content: '<p>Leases are long-term obligations; a few negotiated terms can change outcomes materially.</p>',
      labels: ['Real Estate', 'Contract Law'],
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      timeToRead: 9,
      status: 'published',
    },
    {
      title: 'Immigration Options for Skilled Workers',
      summary: 'A high-level map of common visa categories and timing considerations for employers.',
      content: '<p>Employer-sponsored pathways vary by role, wage, and country-specific rules.</p>',
      labels: ['Immigration', 'Employment Law'],
      coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
      timeToRead: 10,
      status: 'published',
    },
    {
      title: 'Tax Residency and Remote Work Abroad',
      summary: 'Why “working from anywhere” can trigger filing obligations in more than one place.',
      content: '<p>Residency rules differ by jurisdiction; days-in-country tests are only one piece.</p>',
      labels: ['Tax Law', 'Updates'],
      coverImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
      timeToRead: 7,
      status: 'published',
    },
    {
      title: 'Draft: Criminal Defense — First 48 Hours',
      summary: 'What families should know about counsel, bail, and preserving evidence early on.',
      content: '<p>Early decisions affect options downstream; prompt counsel can help navigate intake.</p>',
      labels: ['Criminal Law', 'Legal Basics'],
      coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
      timeToRead: 6,
      status: 'draft',
    },
    {
      title: 'Human Rights Reporting for NGOs',
      summary: 'Documenting incidents responsibly and aligning field notes with later legal strategy.',
      content: '<p>Consistent, dated records support advocacy and any parallel legal processes.</p>',
      labels: ['Human Rights', 'Updates'],
      coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
      timeToRead: 8,
      status: 'published',
    },
    {
      title: 'Constitutional Law: Separation of Powers Primer',
      summary: 'A readable overview of checks and balances for readers following high-court news.',
      content: '<p>Legislative, executive, and judicial functions interact through veto, appointment, and review.</p>',
      labels: ['Constitutional Law', 'Legal Basics'],
      coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
      timeToRead: 12,
      status: 'published',
    },
    {
      title: 'M&A Due Diligence: Red Flags in Contracts',
      summary: 'What buyers’ counsel often scans first in customer and vendor agreements.',
      content: '<p>Change-of-control, assignment, and liability caps frequently appear in early issue lists.</p>',
      labels: ['Corporate Law', 'Contract Law'],
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      timeToRead: 11,
      status: 'published',
    },
    {
      title: 'Draft: Cyber Incident Playbook Outline',
      summary: 'Roles, timelines, and regulator touchpoints for a tabletop-friendly outline.',
      content: '<p>Tabletops test notification chains and evidence preservation before a real event.</p>',
      labels: ['Cyber Law', 'Updates'],
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      timeToRead: 5,
      status: 'draft',
    },
    {
      title: 'Estate Planning Documents Everyone Should Know',
      summary: 'Wills, trusts, powers of attorney — what each does and how they fit together.',
      content: '<p>Core documents address probate avoidance, healthcare decisions, and asset transfer.</p>',
      labels: ['Family Law', 'Legal Basics'],
      coverImage: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
      timeToRead: 6,
      status: 'published',
    },
  ];

  return seeds.map((p, i) => {
    const created = i === 0 ? now : daysAgoIso(i * 3);
    return {
      ...p,
      id: uuidv4(),
      createdAt: created,
      updatedAt: created,
    };
  });
}

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(loadPosts);
  const [availableTags, setAvailableTags] = useState<string[]>(loadTags);

  const persist = useCallback((updated: Post[]) => {
    setPosts(updated);
    savePosts(updated);
  }, []);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !availableTags.includes(trimmed)) {
        const updated = [...availableTags, trimmed];
        setAvailableTags(updated);
        persistTags(updated);
      }
    },
    [availableTags],
  );

  const removeTag = useCallback(
    (tag: string) => {
      const updated = availableTags.filter((t) => t !== tag);
      setAvailableTags(updated);
      persistTags(updated);
    },
    [availableTags],
  );

  const addPost = useCallback(
    (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post => {
      const now = new Date().toISOString();
      const post: Post = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
      persist(sortPostsByRecent([post, ...posts]));
      return post;
    },
    [posts, persist],
  );

  const updatePost = useCallback(
    (id: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>) => {
      const now = new Date().toISOString();
      const next = posts.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: now } : p,
      );
      persist(sortPostsByRecent(next));
    },
    [posts, persist],
  );

  const deletePost = useCallback(
    (id: string) => {
      persist(posts.filter((p) => p.id !== id));
    },
    [posts, persist],
  );

  const getPost = useCallback((id: string) => posts.find((p) => p.id === id), [posts]);

  return (
    <PostContext.Provider value={{ posts, addPost, updatePost, deletePost, getPost, availableTags, addTag, removeTag }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error('usePosts must be used within PostProvider');
  return ctx;
}
