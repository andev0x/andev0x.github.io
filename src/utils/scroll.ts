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
