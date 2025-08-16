import { createContext, useContext } from 'react';

interface HintContextType {
  registerHint: (element: HTMLElement, hintKey: string) => void;
  unregisterHint: (element: HTMLElement) => void;
}

export const HintContext = createContext<HintContextType | undefined>(undefined);

export const useHintContext = () => {
  const context = useContext(HintContext);
  if (!context) {
    throw new Error('useHintContext must be used within a HintProvider');
  }
  return context;
};