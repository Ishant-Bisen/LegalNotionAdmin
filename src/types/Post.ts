export type PostStatus = 'draft' | 'published' | 'archived';

/** Document from GET/POST/PATCH /api/blogs */
export interface ApiBlogDocument {
  _id: string;
  title: string;
  summary: string;
  content: string;
  labels: string[];
  coverImage: string;
  timeToRead: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  /** Short excerpt for cards, listings, and SEO — plain text */
  summary: string;
  content: string;
  labels: string[];
  coverImage: string;
  timeToRead: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export function mapApiBlogToPost(doc: ApiBlogDocument): Post {
  return {
    id: doc._id,
    title: doc.title,
    summary: doc.summary ?? '',
    content: doc.content ?? '',
    labels: Array.isArray(doc.labels) ? doc.labels : [],
    coverImage: doc.coverImage ?? '',
    timeToRead: typeof doc.timeToRead === 'number' && Number.isFinite(doc.timeToRead) ? doc.timeToRead : 0,
    status: doc.status === 'published' || doc.status === 'archived' || doc.status === 'draft' ? doc.status : 'draft',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
