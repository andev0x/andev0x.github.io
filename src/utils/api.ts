const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// variables

export async function fetchComments(postId: string) {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function postComment(postId: string, comment: { author: string; content: string }) {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}

export async function fetchRatings(postId: string) {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/ratings`);
  if (!res.ok) throw new Error('Failed to fetch ratings');
  return res.json();
}

export async function postRating(postId: string, rating: { value: number }) {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rating),
  });
  if (!res.ok) throw new Error('Failed to post rating');
  return res.json();
} 