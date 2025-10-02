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
      posts = posts.filter(result => result.item.category === selectedCategory);
    }
    return posts.sort((a, b) => new Date(b.item.date).getTime() - new Date(a.item.date).getTime());
  }, [searchResults, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = blogPosts.map(post => post.category);
    return Array.from(new Set(allCategories));
  }, []);

  

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
        
        {selectedPost ? (
          <PostDetail post={selectedPost} onBack={handleBackToList} />
        ) : (
          <>
            <div className="mb-8">
              <div className="text-terminal-green/60 terminal-accent text-sm mb-2">
                {searchTerm && `Search results for "${searchTerm}"`}
                {selectedCategory && `Category: ${selectedCategory}`}
                {!searchTerm && !selectedCategory && 'Latest posts'}
              </div>
            </div>
            <PostList
              posts={filteredPosts}
              onPostClick={handlePostClick}
            />
          </>
        )}
      </main>

      <Footer />

      {showAboutMe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative">
            <TerminalAboutMe onClose={() => setShowAboutMe(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;