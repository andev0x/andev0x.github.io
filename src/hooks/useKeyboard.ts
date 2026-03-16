import { useEffect, useCallback } from 'react';

interface UseKeyboardProps {
  onSearch?: () => void;
  onScrollDown?: () => void;
  onScrollUp?: () => void;
  onScrollTop?: () => void;
  onScrollBottom?: () => void;
  onEscape?: () => void;
  onToggleMode?: () => void;
  onToggleCategory?: () => void;
  onNextPost?: () => void;
  onPrevPost?: () => void;
  onSelectPost?: () => void;
}

export const useKeyboard = ({
  onSearch,
  onScrollDown,
  onScrollUp,
  onScrollTop,
  onScrollBottom,
  onEscape,
  onToggleMode,
  onToggleCategory,
  onNextPost,
  onPrevPost,
  onSelectPost,
}: UseKeyboardProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle keyboard shortcuts when typing in inputs
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      if (event.key === 'Escape') {
        onEscape?.();
      }
      return;
    }

    switch (event.key) {
      case '/':
        event.preventDefault();
        onSearch?.();
        break;
      case 'c':
        event.preventDefault();
        onToggleCategory?.();
        break;
      case 't':
        event.preventDefault();
        onToggleMode?.();
        break;
      case 'Tab':
        if (onNextPost || onPrevPost) {
          event.preventDefault();
          if (event.shiftKey) {
            onPrevPost?.();
          } else {
            onNextPost?.();
          }
        }
        break;
      case 'Enter':
        if (onSelectPost) {
          event.preventDefault();
          onSelectPost?.();
        }
        break;
      case 'j':
        event.preventDefault();
        if (onNextPost) {
          onNextPost?.();
        } else {
          onScrollDown?.();
        }
        break;
      case 'k':
        event.preventDefault();
        if (onPrevPost) {
          onPrevPost?.();
        } else {
          onScrollUp?.();
        }
        break;
      case 'g':
        if (event.shiftKey) {
          // Shift+G for bottom
          event.preventDefault();
          onScrollBottom?.();
        } else {
          // g for top
          event.preventDefault();
          onScrollTop?.();
        }
        break;
      case 'Escape':
        onEscape?.();
        break;
    }
  }, [onSearch, onScrollDown, onScrollUp, onScrollTop, onScrollBottom, onEscape, onToggleMode, onToggleCategory, onNextPost, onPrevPost, onSelectPost]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};