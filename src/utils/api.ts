const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://go-blog-production-e388.up.railway.app/api/v1';

// Mock data storage (fallback when backend is unavailable)
const mockComments: Record<string, Array<{ id: string; author: string; content: string; timestamp: string }>> = {};
const mockRatings: Record<string, Array<{ id: string; value: number; timestamp: string }>> = {};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to check if backend is available
const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/test`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout for production
    });
    return response.ok;
  } catch {
    return false;
  }
};

export async function fetchComments(postId: string) {
  console.log('Fetching comments for post:', postId);
  
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
      if (response.ok) {
        const comments = await response.json();
        console.log('Backend comments:', comments);
        return comments;
      }
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error);
    }
  }
  
  // Fallback to mock data
  await new Promise(resolve => setTimeout(resolve, 500));
  const comments = mockComments[postId] || [];
  console.log('Returning mock comments:', comments);
  return comments;
}

export async function postComment(postId: string, comment: { author: string; content: string }) {
  console.log('Posting comment to:', `${API_BASE_URL}/posts/${postId}/comments`);
  console.log('Comment data:', comment);
  
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
      });
      
      if (response.ok) {
        const newComment = await response.json();
        console.log('Backend response:', newComment);
        return newComment;
      } else {
        const error = await response.text();
        throw new Error(`Backend error: ${error}`);
      }
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error);
    }
  }
  
  // Fallback to mock data
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newComment = {
    id: generateId(),
    ...comment,
    timestamp: new Date().toISOString()
  };
  
  if (!mockComments[postId]) {
    mockComments[postId] = [];
  }
  mockComments[postId].push(newComment);
  
  console.log('Mock response:', newComment);
  return newComment;
}

export async function fetchRatings(postId: string) {
  console.log('Fetching ratings for post:', postId);
  
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/ratings`);
      if (response.ok) {
        const ratings = await response.json();
        console.log('Backend ratings:', ratings);
        return ratings;
      }
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error);
    }
  }
  
  // Fallback to mock data
  await new Promise(resolve => setTimeout(resolve, 300));
  const ratings = mockRatings[postId] || [];
  console.log('Returning mock ratings:', ratings);
  return ratings;
}

export async function postRating(postId: string, rating: { value: number }) {
  console.log('Posting rating to:', `${API_BASE_URL}/posts/${postId}/ratings`);
  console.log('Rating data:', rating);
  
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rating),
      });
      
      if (response.ok) {
        const newRating = await response.json();
        console.log('Backend response:', newRating);
        return newRating;
      } else {
        const error = await response.text();
        throw new Error(`Backend error: ${error}`);
      }
    } catch (error) {
      console.warn('Backend unavailable, using mock data:', error);
    }
  }
  
  // Fallback to mock data
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const newRating = {
    id: generateId(),
    ...rating,
    timestamp: new Date().toISOString()
  };
  
  if (!mockRatings[postId]) {
    mockRatings[postId] = [];
  }
  mockRatings[postId].push(newRating);
  
  console.log('Mock response:', newRating);
  return newRating;
} 