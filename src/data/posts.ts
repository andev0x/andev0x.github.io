import { BlogPost } from '../types';
import { loadMarkdownPosts } from '../utils/markdownLoader';

export const blogPosts: BlogPost[] = loadMarkdownPosts();