import React, { useEffect, useRef, useState } from 'react';

/**
 * Giscus configuration.
 *
 * Defaults point at this repository so a normal `npm run build` needs no
 * environment variables. Every value can still be overridden per environment
 * (for example a staging repository) through `VITE_GISCUS_*`.
 *
 * One-time setup on GitHub: Discussions must be enabled and the giscus app
 * (https://github.com/apps/giscus) must be installed on the repository.
 */
const REPO = import.meta.env.VITE_GISCUS_REPO || 'andev0x/andev0x.github.io';
const REPO_ID = import.meta.env.VITE_GISCUS_REPO_ID || 'R_kgDOPEs9-w';
const CATEGORY = import.meta.env.VITE_GISCUS_CATEGORY || 'Announcements';
const CATEGORY_ID = import.meta.env.VITE_GISCUS_CATEGORY_ID || 'DIC_kwDOPEs9-84DJOeS';

const SCRIPT_SRC = 'https://giscus.app/client.js';
const GISCUS_ORIGIN = 'https://giscus.app';
const DISCUSSIONS_URL = `https://github.com/${REPO}/discussions`;

type Theme = 'light' | 'dark';

const currentTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

interface CommentsProps {
  /**
   * Stable discussion key. The site uses fragment routing, so the pathname is
   * `/` for every article; the post id is the only unique identity available.
   */
  term: string;
}

/**
 * GitHub Discussions comments via giscus.
 *
 * The thread is loaded **on request**, not when it scrolls into view.
 *
 * giscus renders the discussion in a cross-origin iframe, and Chrome gives
 * every cross-origin frame its own renderer process: loading it costs a
 * separate process and roughly 150 MB of resident memory, whether or not the
 * reader ever looks at the thread. Asking for it explicitly means that cost
 * is only paid by the people who want to read or write a comment.
 *
 * Once loaded, the thread behaves normally: theme changes are pushed into the
 * existing iframe with `postMessage`, so toggling light/dark never reloads it.
 */
export const Comments: React.FC<CommentsProps> = ({ term }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRequested, setIsRequested] = useState(false);
  const [theme, setTheme] = useState<Theme>(currentTheme);

  // `useTheme` flips a class on <html> instead of re-rendering consumers, so
  // follow the attribute rather than duplicating the theme state here.
  useEffect(() => {
    if (!isRequested) return;
    const observer = new MutationObserver(() => setTheme(currentTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [isRequested]);

  // Keep the latest theme in a ref so the injection effect does not need to
  // recreate the script, and forward changes to the live iframe.
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;

    const frame = containerRef.current?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, GISCUS_ORIGIN);
  }, [theme]);

  useEffect(() => {
    if (!isRequested) return;

    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.setAttribute('data-repo', REPO);
    script.setAttribute('data-repo-id', REPO_ID);
    script.setAttribute('data-category', CATEGORY);
    script.setAttribute('data-category-id', CATEGORY_ID);
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', term);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', themeRef.current);
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    container.appendChild(script);

    return () => container.replaceChildren();
  }, [isRequested, term]);

  if (!REPO || !REPO_ID || !CATEGORY || !CATEGORY_ID) {
    return (
      <p className="panel rounded-xl p-4 font-mono text-xs text-fg-subtle sm:p-5">
        Comments are not configured. Set the VITE_GISCUS_* variables to enable them.
      </p>
    );
  }

  return (
    <div className="panel overflow-hidden rounded-xl">
      {isRequested ? (
        <div ref={containerRef} className="min-h-[140px]" />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <p className="font-mono text-xs text-fg-subtle">
            the thread is not loaded yet
          </p>
          <button
            type="button"
            onClick={() => setIsRequested(true)}
            className="rounded-md border border-accent/50 px-3 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent/10"
          >
            load comments
          </button>
        </div>
      )}
      <p className="border-t border-border px-4 py-2 font-mono text-[0.65rem] text-fg-subtle">
        comments run on GitHub Discussions ·{' '}
        <a
          href={DISCUSSIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-150 hover:text-accent"
        >
          open the thread
        </a>
      </p>
    </div>
  );
};
