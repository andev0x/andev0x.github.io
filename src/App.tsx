import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PostList } from './components/PostList';
import { PostDetail } from './components/PostDetail';
import { Footer } from './components/Footer';
import { useKeyboard } from './hooks/useKeyboard';
import { useSearch } from './hooks/useSearch';
import { blogPosts } from './data/posts';
import { BlogPost } from './types';

console.log('Loaded blog posts:', blogPosts);

function App() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const SPECIAL_CATEGORIES = ["About", "Projects"];

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearchActive,
    activateSearch,
    deactivateSearch,
  } = useSearch(blogPosts);

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    let posts = searchResults;
    if (selectedCategory) {
      posts = posts.filter(post => post.categories.includes(selectedCategory));
    }
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchResults, selectedCategory]);

  // Get unique categories, excluding special ones
  const categories = useMemo(() => {
    const allCategories = blogPosts.flatMap(post => post.categories);
    return Array.from(new Set(allCategories)).filter(cat => !SPECIAL_CATEGORIES.includes(cat));
  }, [SPECIAL_CATEGORIES]);

  // Get special pages
  const aboutPost = blogPosts.find(post => post.categories.includes("About"));
  const projectsPost = blogPosts.find(post => post.categories.includes("Projects"));

  // Keyboard navigation
  useKeyboard({
    onSearch: activateSearch,
    onScrollDown: () => window.scrollBy(0, 100),
    onScrollUp: () => window.scrollBy(0, -100),
    onScrollTop: () => window.scrollTo(0, 0),
    onScrollBottom: () => window.scrollTo(0, document.body.scrollHeight),
    onEscape: () => {
      if (selectedPost) {
        setSelectedPost(null);
      } else if (isSearchActive) {
        deactivateSearch();
      }
    },
  });

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen relative text-terminal-green">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isSearchActive={isSearchActive}
        onSearchActivate={activateSearch}
        onSearchDeactivate={deactivateSearch}
      />

      {!selectedPost && (
        <Navigation
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Special navigation for About and Projects */}
        {!selectedPost && (
          <div className="flex gap-4 mb-8">
            {aboutPost && (
              <button
                className="px-4 py-2 rounded bg-terminal-green/10 border border-terminal-green/40 text-terminal-green font-vt323 hover:bg-terminal-green/20 transition"
                onClick={() => setSelectedPost(aboutPost)}
              >
                About Me
              </button>
            )}
            {projectsPost && (
              <button
                className="px-4 py-2 rounded bg-terminal-green/10 border border-terminal-green/40 text-terminal-green font-vt323 hover:bg-terminal-green/20 transition"
                onClick={() => setSelectedPost(projectsPost)}
              >
                Projects
              </button>
            )}
          </div>
        )}
        {selectedPost ? (
          <PostDetail post={selectedPost} onBack={handleBackToList} />
        ) : (
          <>
            <div className="mb-8">
              <div className="text-terminal-green/60 terminal-accent text-sm mb-2">
                {searchTerm && `Search results for "${searchTerm}"`}
                {selectedCategory && `Category: ${selectedCategory}`}
                {!searchTerm && !selectedCategory && 'All posts'}
                {' '}
                ({filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'})
              </div>
            </div>
            <PostList posts={filteredPosts} onPostClick={handlePostClick} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;