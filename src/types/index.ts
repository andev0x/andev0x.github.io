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
  score: number;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}