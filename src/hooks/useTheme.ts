import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'andev0x-theme';
const QUERY = '(prefers-color-scheme: dark)';

const systemTheme = (): 'light' | 'dark' =>
  typeof matchMedia === 'function' && matchMedia(QUERY).matches ? 'dark' : 'light';

const readStored = (): 'light' | 'dark' | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
};

/**
 * Applies the theme by toggling a class on <html>.
 *
 * No React state drives the colours — every colour is a CSS custom property,
 * so flipping the class repaints without re-rendering the tree.
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => readStored() ?? systemTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — the choice just will not persist */
    }
  }, [theme]);

  // Follow the OS only while the reader has not made an explicit choice.
  useEffect(() => {
    if (readStored() !== null) return;
    if (typeof matchMedia !== 'function') return;

    const media = matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setThemeState(event.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme: setThemeState, toggleTheme };
};
