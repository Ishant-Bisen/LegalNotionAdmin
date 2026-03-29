import type { Post } from '../types/Post';

/** Most recently touched first (matches Dashboard “recent posts”). Tie-break: newer created. */
export function comparePostsByRecent(a: Post, b: Post): number {
  const ua = new Date(a.updatedAt || a.createdAt).getTime();
  const ub = new Date(b.updatedAt || b.createdAt).getTime();
  if (Number.isNaN(ua) || Number.isNaN(ub)) return 0;
  if (ub !== ua) return ub - ua;
  const ca = new Date(a.createdAt).getTime();
  const cb = new Date(b.createdAt).getTime();
  return cb - ca;
}

export function sortPostsByRecent(posts: Post[]): Post[] {
  return [...posts].sort(comparePostsByRecent);
}
