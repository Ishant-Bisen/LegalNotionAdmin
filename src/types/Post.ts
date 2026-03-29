export type PostStatus = 'draft' | 'published';

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
