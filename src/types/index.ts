import Fuse from 'fuse.js';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  tags: string[];
  categories: string[];
  readingTime: number;
  featured: boolean;
}

export interface SearchResult {
  item: BlogPost;
  score?: number;
  matches?: Fuse.FuseResultMatch[];
}


export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

// Comment type for a blog post
export interface Comment {
  id: string;
  postId: string; // BlogPost.id or slug
  author: string;
  content: string;
  createdAt: string;
  rating?: number;
}

// Rating type for a blog post
export interface Rating {
  postId: string; // BlogPost.id or slug
  average: number; // Average rating (e.g., 4.2)
  count: number;   // Number of ratings
  userRating?: number; // Optional: current user's rating
}

// API interface for comments
export interface CommentAPI {
  getComments(postId: string): Promise<Comment[]>;
  addComment(postId: string, author: string, content: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
}

// API interface for ratings
export interface RatingAPI {
  getRating(postId: string): Promise<Rating>;
  ratePost(postId: string, value: number): Promise<Rating>;
}