import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isSearchActive: boolean;
  onSearchActivate: () => void;
  onSearchDeactivate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  isSearchActive,
  onSearchActivate,
  onSearchDeactivate,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  return (
    <header className="backdrop-blur-sm border-b border-terminal-green/30 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between bg-transparent">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl md:text-4xl font-vt323 animate-pulse-glow hover-glow">
            <span className="text-terminal-green">sudo_【アン】andev0x</span>
          </h1>
          <div className="hidden md:block text-terminal-green/60 terminal-accent">
            [a shadow never rests]
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {isSearchActive ? (
              <div className="flex items-center space-x-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search posts..."
                  className="bg-terminal-black border border-terminal-green rounded px-3 py-1 text-terminal-green placeholder-terminal-green/70 focus-glow font-vt323 w-48 md:w-64"
                />
                <button
                  onClick={onSearchDeactivate}
                  className="text-terminal-green hover-glow transition-colors p-1"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={onSearchActivate}
                className="flex items-center space-x-2 text-terminal-green hover-glow transition-colors"
                aria-label="Search posts"
              >
                <Search size={20} />
                <span className="hidden md:inline font-vt323">Search [/]</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};