import fm from 'front-matter';
import { BlogPost } from '../types';

// Import all .md files as raw strings
const postFiles = import.meta.glob('../data/posts/*.md', { as: 'raw', eager: true });

export const blogPosts: BlogPost[] = Object.entries(postFiles).map(([path, rawContent]) => {
  const { attributes, body } = fm(rawContent as string);
  const meta = attributes as Partial<BlogPost>;
  return {
    id: meta.slug || path,
    title: meta.title || '',
    slug: meta.slug || '',
    content: body || '',
    excerpt: meta.excerpt || '',
    date: meta.date || '',
    tags: meta.tags || [],
    categories: meta.categories || [],
    readingTime: meta.readingTime || 1,
    featured: meta.featured || false,
  };
});
