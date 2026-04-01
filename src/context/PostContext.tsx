import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type { Post } from '../types/Post';
import { mapApiBlogToPost } from '../types/Post';
import { sortPostsByRecent } from '../utils/sortPosts';
import { fetchBlogsList, fetchBlog, createBlog, patchBlog, deleteBlog } from '../api/blogsApi';

const TAGS_EXTRA_KEY = 'legalnotion_blog_tag_suggestions';

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

function loadExtraTags(): string[] {
  try {
    const raw = localStorage.getItem(TAGS_EXTRA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

function persistExtraTags(tags: string[]) {
  localStorage.setItem(TAGS_EXTRA_KEY, JSON.stringify(tags));
}

function uniqueSorted(tags: string[]): string[] {
  return [...new Set(tags.map((t) => t.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

interface PostContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refreshPosts: (opts?: { silent?: boolean }) => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Post>;
  updatePost: (id: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getPost: (id: string) => Post | undefined;
  /** Load one blog by id (GET /api/blogs/:id) and merge into local list */
  fetchPostById: (id: string) => Promise<Post | null>;
  availableTags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}

const PostContext = createContext<PostContextType | null>(null);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extraTags, setExtraTags] = useState<string[]>(() => loadExtraTags());
  /** Drop stale list responses when a newer refetch or mutation-driven refresh started later. */
  const listFetchGen = useRef(0);

  const refreshPosts = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    const gen = ++listFetchGen.current;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const docs = await fetchBlogsList();
      if (gen !== listFetchGen.current) return;
      setPosts(docs.map(mapApiBlogToPost));
      setError(null);
    } catch (e) {
      if (gen !== listFetchGen.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load blogs');
      setPosts([]);
    } finally {
      if (gen === listFetchGen.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPosts();
  }, [refreshPosts]);

  const mergePostIntoList = useCallback((post: Post) => {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === post.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = post;
        return sortPostsByRecent(next);
      }
      return sortPostsByRecent([post, ...prev]);
    });
  }, []);

  const fetchPostById = useCallback(
    async (id: string) => {
      try {
        const doc = await fetchBlog(id);
        const post = mapApiBlogToPost(doc);
        mergePostIntoList(post);
        return post;
      } catch {
        return null;
      }
    },
    [mergePostIntoList],
  );

  const addPost = useCallback(
    async (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> => {
      const doc = await createBlog({
        title: data.title.trim(),
        summary: data.summary,
        content: data.content,
        labels: data.labels,
        coverImage: data.coverImage,
        timeToRead: data.timeToRead,
        status: data.status,
      });
      await refreshPosts({ silent: true });
      return mapApiBlogToPost(doc);
    },
    [refreshPosts],
  );

  const updatePost = useCallback(
    async (id: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>) => {
      const body: Record<string, unknown> = {};
      if (data.title !== undefined) body.title = data.title;
      if (data.summary !== undefined) body.summary = data.summary;
      if (data.content !== undefined) body.content = data.content;
      if (data.labels !== undefined) body.labels = data.labels;
      if (data.coverImage !== undefined) body.coverImage = data.coverImage;
      if (data.timeToRead !== undefined) body.timeToRead = data.timeToRead;
      if (data.status !== undefined) body.status = data.status;
      await patchBlog(id, body);
      await refreshPosts({ silent: true });
    },
    [refreshPosts],
  );

  const deletePost = useCallback(
    async (id: string) => {
      await deleteBlog(id);
      await refreshPosts({ silent: true });
    },
    [refreshPosts],
  );

  const getPost = useCallback((id: string) => posts.find((p) => p.id === id), [posts]);

  const availableTags = useMemo(() => {
    const fromPosts = posts.flatMap((p) => p.labels);
    return uniqueSorted([...DEFAULT_TAGS, ...extraTags, ...fromPosts]);
  }, [posts, extraTags]);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed || availableTags.includes(trimmed)) return;
      const updated = [...extraTags, trimmed];
      setExtraTags(updated);
      persistExtraTags(updated);
    },
    [availableTags, extraTags],
  );

  const removeTag = useCallback(
    (tag: string) => {
      const updated = extraTags.filter((t) => t !== tag);
      setExtraTags(updated);
      persistExtraTags(updated);
    },
    [extraTags],
  );

  const value: PostContextType = {
    posts,
    loading,
    error,
    refreshPosts,
    addPost,
    updatePost,
    deletePost,
    getPost,
    fetchPostById,
    availableTags,
    addTag,
    removeTag,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error('usePosts must be used within PostProvider');
  return ctx;
}
