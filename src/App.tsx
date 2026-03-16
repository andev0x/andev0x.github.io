import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { PostList } from './components/PostList';
import { PostDetail } from './components/PostDetail';
import { Footer } from './components/Footer';
import { useKeyboard } from './hooks/useKeyboard';
import { useSearch } from './hooks/useSearch';
import { blogPosts } from './data/posts';
import { BlogPost, SearchResult } from './types';
import { TerminalAboutMe } from './components/TerminalAboutMe';
import CategoryBar from './components/CategoryBar'; // Import CategoryBar
import NavigationHint from './components/NavigationHint'; // Import NavigationHint

console.log('Loaded blog posts:', blogPosts);

function App() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // Renamed for clarity
  const [showAboutMe, setShowAboutMe] = useState(false);
  const [toggleMode, setToggleMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

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
    let posts = searchResults as SearchResult[];
    if (activeCategory) {
      posts = posts.filter(result => result.item.categories.includes(activeCategory));
    }
    return posts.sort((a, b) => new Date(b.item.date).getTime() - new Date(a.item.date).getTime());
  }, [searchResults, activeCategory]);

  // Toggle mode functions
  const handleToggleMode = () => {
    if (!toggleMode && filteredPosts.length > 0) {
      setToggleMode(true);
      setSelectedIndex(0);
    } else {
      setToggleMode(false);
      setSelectedIndex(0);
    }
  };

  const handleNextPost = () => {
    if (filteredPosts.length === 0) return;
    setSelectedIndex(prev => (prev + 1) % filteredPosts.length);
  };

  const handlePrevPost = () => {
    if (filteredPosts.length === 0) return;
    setSelectedIndex(prev => (prev - 1 + filteredPosts.length) % filteredPosts.length);
  };

  const handleSelectCurrentPost = () => {
    if (toggleMode && filteredPosts.length > 0 && filteredPosts[selectedIndex]) {
      setSelectedPost(filteredPosts[selectedIndex].item);
      setToggleMode(false);
      setSelectedIndex(0);
    }
  };

  // Auto-scroll to selected post in toggle mode and reset index when posts change
  useEffect(() => {
    if (toggleMode) {
      // Reset selected index if it's out of bounds
      if (selectedIndex >= filteredPosts.length) {
        setSelectedIndex(Math.max(0, filteredPosts.length - 1));
        return;
      }
      
      if (filteredPosts.length > 0) {
        const postElements = document.querySelectorAll('[data-post-index]');
        const selectedElement = postElements[selectedIndex];
        if (selectedElement) {
          selectedElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    }
  }, [toggleMode, selectedIndex, filteredPosts.length]);

  // No longer need to compute categories here, CategoryBar does it internally
  // const categories = useMemo(() => {
  //   const allCategories = blogPosts.flatMap(post => post.categories);
  //   return Array.from(new Set(allCategories));
  // }, []);

  

  // Keyboard navigation
  useKeyboard({
    onSearch: activateSearch,
    onToggleMode: handleToggleMode,
    onNextPost: toggleMode ? handleNextPost : undefined,
    onPrevPost: toggleMode ? handlePrevPost : undefined,
    onSelectPost: toggleMode ? handleSelectCurrentPost : undefined,
    onScrollDown: toggleMode ? undefined : () => window.scrollBy(0, 100),
    onScrollUp: toggleMode ? undefined : () => window.scrollBy(0, -100),
    onScrollTop: () => window.scrollTo(0, 0),
    onScrollBottom: () => window.scrollTo(0, document.body.scrollHeight),
    onToggleCategory: () => setCategoryMenuOpen(o => !o),
    onEscape: () => {
      if (categoryMenuOpen) {
        setCategoryMenuOpen(false);
      } else if (toggleMode) {
        setToggleMode(false);
        setSelectedIndex(0);
      } else if (selectedPost) {
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
          <>
            <CategoryBar
              onSelectCategory={setActiveCategory}
              activeCategory={activeCategory}
              isOpen={categoryMenuOpen}
              onToggle={() => setCategoryMenuOpen(o => !o)}
            />
            <NavigationHint toggleMode={toggleMode} />
          </>
        )}

      <main className="container mx-auto px-4 py-8">
        
        {selectedPost ? (
          <PostDetail post={selectedPost} onBack={handleBackToList} />
        ) : (
          <>
            <div className="mb-8">
              <div className="text-terminal-green/60 terminal-accent text-sm mb-2">
                {searchTerm && `Search results for "${searchTerm}"`}
                {activeCategory && `Category: ${activeCategory}`}
                {!searchTerm && !activeCategory && 'Latest posts'}
              </div>
            </div>
            <PostList
              posts={filteredPosts}
              onPostClick={handlePostClick}
              toggleMode={toggleMode}
              selectedIndex={selectedIndex}
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