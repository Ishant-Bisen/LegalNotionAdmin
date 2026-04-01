/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Direct API URL (bypasses dev proxy; requires backend CORS). Prefer unset in dev. */
  readonly VITE_API_BASE?: string;
  /** Where Vite proxies `/api` in dev (default http://localhost:3000). */
  readonly VITE_DEV_PROXY_TARGET?: string;
  /** Blog REST path prefix (default `/api/blogs`). Example: `/api/v1/blogs` */
  readonly VITE_BLOGS_API_PATH?: string;
  /** Candidates REST path prefix (default `/api/candidates`). Example: `/api/v1/candidates` */
  readonly VITE_CANDIDATES_API_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
