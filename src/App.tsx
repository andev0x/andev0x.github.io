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
import { TerminalAboutMe } from './components/TerminalAboutMe';

console.log('Loaded blog posts:', blogPosts);

function App() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAboutMe, setShowAboutMe] = useState(false);

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
    const SPECIAL_CATEGORIES = ["About", "Projects"];
    const allCategories = blogPosts.flatMap(post => post.categories);
    return Array.from(new Set(allCategories)).filter(cat => !SPECIAL_CATEGORIES.includes(cat));
  }, []);

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

  const handleSearchActivate = () => {
    activateSearch();
  };

  const handleSearchDeactivate = () => {
    deactivateSearch();
  };

  return (
    <div className="min-h-screen text-terminal-green">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isSearchActive={isSearchActive}
        onSearchActivate={handleSearchActivate}
        onSearchDeactivate={handleSearchDeactivate}
        onAboutMe={() => setShowAboutMe(true)}
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

      {showAboutMe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative">
            <button
              onClick={() => setShowAboutMe(false)}
              className="absolute top-1 right-2 text-terminal-green/60 hover:text-terminal-green bg-black/60 rounded-full p-2 border border-terminal-green/30"
              aria-label="Close About Me"
            >
              ×
            </button>
            <TerminalAboutMe />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;