/** Scroll helpers that respect the OS motion preference. */

const prefersReducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const motion = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

export const scrollToTop = (): void => window.scrollTo({ top: 0, behavior: motion() });

export const scrollToBottom = (): void =>
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: motion() });

export const scrollBy = (delta: number): void => window.scrollBy({ top: delta, behavior: motion() });

export const scrollToFraction = (fraction: number): void => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.max(0, max * fraction), behavior: motion() });
};

/** Scroll an element into view without yanking the whole page. */
export const revealElement = (
  element: HTMLElement | null | undefined,
  block: ScrollLogicalPosition = 'center',
): void => {
  element?.scrollIntoView({ behavior: motion(), block });
};

/**
 * Scroll to a heading by id without touching `location.hash`.
 * Post routes live in the fragment (`#/post/<id>`), so a plain `href="#slug"`
 * would replace the route and break share/reload/back — scroll instead and
 * leave the URL intact. `scroll-margin-top` on the prose headings accounts
 * for the sticky header.
 *
 * Retries briefly when the target is not in the DOM yet: the TOC renders as
 * soon as the Markdown string arrives, while the heading elements appear only
 * after the lazy `Markdown` chunk resolves — a click in that window would
 * otherwise silently do nothing.
 */
export const scrollToId = (id: string): void => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: motion(), block: 'start' });
    return;
  }
  let attempts = 0;
  const retry = (): void => {
    const late = document.getElementById(id);
    if (late) {
      late.scrollIntoView({ behavior: motion(), block: 'start' });
      return;
    }
    if (++attempts < 10) requestAnimationFrame(retry);
  };
  requestAnimationFrame(retry);
};
