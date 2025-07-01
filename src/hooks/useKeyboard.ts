import { useEffect, useCallback } from 'react';

interface UseKeyboardProps {
  onSearch?: () => void;
  onScrollDown?: () => void;
  onScrollUp?: () => void;
  onScrollTop?: () => void;
  onScrollBottom?: () => void;
  onEscape?: () => void;
}

export const useKeyboard = ({
  onSearch,
  onScrollDown,
  onScrollUp,
  onScrollTop,
  onScrollBottom,
  onEscape,
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
      case 'j':
        event.preventDefault();
        onScrollDown?.();
        break;
      case 'k':
        event.preventDefault();
        onScrollUp?.();
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
  }, [onSearch, onScrollDown, onScrollUp, onScrollTop, onScrollBottom, onEscape]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};