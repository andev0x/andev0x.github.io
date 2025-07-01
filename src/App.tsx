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

function App() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
      posts = posts.filter(post => post.category === selectedCategory);
    }
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchResults, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(blogPosts.map(post => post.category)));
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

  return (
    <div className="min-h-screen bg-terminal-black text-terminal-green">
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