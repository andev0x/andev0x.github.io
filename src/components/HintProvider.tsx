import React, { useState, useEffect, useCallback } from 'react';
import { Hint } from './Hint';
import { HintContext } from '../hooks/useHintContext';

export const HintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hints, setHints] = useState<Map<HTMLElement, string>>(new Map());
  const [showHints, setShowHints] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    console.log('Key pressed:', event.key); // Debug log
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (showHints) {
      if (event.key === 'Escape') {
        setShowHints(false);
        event.preventDefault();
        return;
      }

      const hintKey = event.key.toLowerCase();
      const targetElement = Array.from(hints.entries()).find(([, key]) => key === hintKey)?.[0];

      if (targetElement) {
        console.log('Hint triggered for key:', hintKey); // Debug log
        (targetElement as HTMLElement).click();
        setShowHints(false);
        event.preventDefault();
      }
    } else {
      if (event.key === 'h' && !event.altKey && !event.ctrlKey && !event.metaKey) {
        console.log('Hints activated'); // Debug log
        setShowHints(true);
        event.preventDefault();
      }
    }
  }, [hints, showHints]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const registerHint = (element: HTMLElement, hintKey: string) => {
    setHints(prev => new Map(prev).set(element, hintKey));
  };

  const unregisterHint = (element: HTMLElement) => {
    setHints(prev => {
      const newHints = new Map(prev);
      newHints.delete(element);
      return newHints;
    });
  };

  return (
    <HintContext.Provider value={{ registerHint, unregisterHint }}>
      {children}
      {showHints && Array.from(hints.entries()).map(([element, hintKey]) => (
        <Hint key={hintKey} element={element} hintKey={hintKey} />
      ))}
    </HintContext.Provider>
  );
};
