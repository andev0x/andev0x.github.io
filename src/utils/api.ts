const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://go-Blog-production-e388.up.railway.app';

export async function fetchComments(postId: string) {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function postComment(postId: string, comment: { author: string; content: string }) {
  console.log('Posting comment to:', `${API_BASE_URL}/posts/${postId}/comments`);
  console.log('Comment data:', comment);
  
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
  
  console.log('Response status:', res.status);
  console.log('Response headers:', Object.fromEntries(res.headers.entries()));
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to post comment: ${res.status} ${res.statusText}`);
  }
  
  const result = await res.json();
  console.log('Success response:', result);
  return result;
}

export async function fetchRatings(postId: string) {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/ratings`);
  if (!res.ok) throw new Error('Failed to fetch ratings');
  return res.json();
}

export async function postRating(postId: string, rating: { value: number }) {
  console.log('Posting rating to:', `${API_BASE_URL}/posts/${postId}/ratings`);
  console.log('Rating data:', rating);
  
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rating),
  });
  
  console.log('Response status:', res.status);
  console.log('Response headers:', Object.fromEntries(res.headers.entries()));
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to post rating: ${res.status} ${res.statusText}`);
  }
  
  const result = await res.json();
  console.log('Success response:', result);
  return result;
} 