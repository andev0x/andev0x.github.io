import type { Comment } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://go-blog-production-e388.up.railway.app/api/v1';

const HEALTH_URL = `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}/test`;
const PROBE_TIMEOUT_MS = 4000;

/* --------------------------------------------------------------------------
   Offline fallback
   When the Go backend is unreachable the UI still works: comments and ratings
   live in memory for the session instead of throwing.
   -------------------------------------------------------------------------- */

const localComments = new Map<string, Comment[]>();
const localRatings = new Map<string, Array<{ id: string; value: number; timestamp: string }>>();

const newId = (): string => Math.random().toString(36).slice(2, 11);

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/* --------------------------------------------------------------------------
   Backend probe
   Single-flight and cached: the previous version hit `/test` before *every*
   read and write, which meant an extra round trip per user action.
   -------------------------------------------------------------------------- */

let probe: Promise<boolean> | null = null;

const probeBackend = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const response = await fetch(HEALTH_URL, { method: 'GET', signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

const isBackendAvailable = (): Promise<boolean> => {
  probe ??= probeBackend().catch(() => false);
  return probe;
};

/** Exposed for tests / manual retry from the UI. */
export const resetBackendProbe = (): void => {
  probe = null;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.json()) as T;
};

/* --------------------------------------------------------------------------
   Normalisation
   The backend has shipped a few field spellings for the same value, so map
   them all onto the frontend shape in one place.
   -------------------------------------------------------------------------- */

type RawComment = {
  id?: string | number;
  postId?: string;
  post_id?: string;
  author?: string;
  name?: string;
  content?: string;
  createdAt?: string;
  created_at?: string;
  timestamp?: string;
  rating?: number;
};

const toComment = (raw: RawComment, postId: string): Comment => ({
  id: String(raw.id ?? newId()),
  postId: raw.postId ?? raw.post_id ?? postId,
  author: raw.author ?? raw.name ?? 'anon',
  content: raw.content ?? '',
  createdAt: raw.createdAt ?? raw.created_at ?? raw.timestamp ?? new Date().toISOString(),
  ...(typeof raw.rating === 'number' ? { rating: raw.rating } : null),
});

/* --------------------------------------------------------------------------
   Comments
   -------------------------------------------------------------------------- */

export async function fetchComments(postId: string): Promise<Comment[]> {
  if (await isBackendAvailable()) {
    try {
      const raw = await request<RawComment[]>(`/posts/${postId}/comments`);
      if (Array.isArray(raw)) return raw.map((item) => toComment(item, postId));
    } catch {
      /* fall through to local cache */
    }
  }

  await delay(250);
  return [...(localComments.get(postId) ?? [])];
}

export async function postComment(
  postId: string,
  comment: { author: string; content: string; rating?: number },
): Promise<Comment> {
  if (await isBackendAvailable()) {
    try {
      const raw = await request<RawComment>(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment),
      });
      return toComment(raw, postId);
    } catch {
      /* fall through to local cache */
    }
  }

  await delay(400);
  const created: Comment = {
    id: newId(),
    postId,
    author: comment.author,
    content: comment.content,
    createdAt: new Date().toISOString(),
    ...(typeof comment.rating === 'number' ? { rating: comment.rating } : null),
  };
  localComments.set(postId, [created, ...(localComments.get(postId) ?? [])]);
  return created;
}

/* --------------------------------------------------------------------------
   Ratings
   -------------------------------------------------------------------------- */

export interface RatingSummary {
  average: number;
  count: number;
}

type RawRating = { id?: string | number; value?: number; rating?: number; timestamp?: string; createdAt?: string; created_at?: string };
type RawRatingsResponse = { average?: number; total?: number; count?: number } | RawRating[];

const summarise = (payload: RawRatingsResponse): RatingSummary => {
  if (!Array.isArray(payload)) {
    return { average: payload.average ?? 0, count: payload.total ?? payload.count ?? 0 };
  }
  const values = payload.map((entry) => entry.value ?? entry.rating ?? 0);
  if (values.length === 0) return { average: 0, count: 0 };
  return {
    average: values.reduce((total, value) => total + value, 0) / values.length,
    count: values.length,
  };
};

export async function fetchRatings(postId: string): Promise<RatingSummary> {
  if (await isBackendAvailable()) {
    try {
      return summarise(await request<RawRatingsResponse>(`/posts/${postId}/ratings`));
    } catch {
      /* fall through to local cache */
    }
  }

  await delay(150);
  const values = (localRatings.get(postId) ?? []).map((entry) => entry.value);
  if (values.length === 0) return { average: 0, count: 0 };
  return {
    average: values.reduce((total, value) => total + value, 0) / values.length,
    count: values.length,
  };
}

export async function postRating(postId: string, value: number): Promise<RatingSummary> {
  if (await isBackendAvailable()) {
    try {
      const raw = await request<RawRating>(`/posts/${postId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      return summarise([raw]);
    } catch {
      /* fall through to local cache */
    }
  }

  await delay(250);
  const list = localRatings.get(postId) ?? [];
  list.push({ id: newId(), value, timestamp: new Date().toISOString() });
  localRatings.set(postId, list);
  const total = list.reduce((sum, entry) => sum + entry.value, 0);
  return { average: total / list.length, count: list.length };
}
