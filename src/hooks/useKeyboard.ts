import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface KeyBinding {
  /**
   * Key notation: `j`, `G`, `?`, `/`, `Enter`, `Escape`, `Ctrl-d`.
   * Multi-letter lowercase keys (`gg`, `zz`) are treated as sequences and wait
   * for the following key, like Vim.
   */
  keys: string;
  /** Group heading used by the help overlay. */
  group: string;
  description: string;
  run: () => void;
  /** Fire even while a text field has focus (e.g. `Escape`). */
  allowInInput?: boolean;
  /** Shown in the hint bar. Off by default for contextual bindings. */
  primary?: boolean;
}

const SEQUENCE_PATTERN = /^[a-z]+$/;
const SEQUENCE_TIMEOUT_MS = 1200;

const isSequence = (keys: string): boolean => keys.length > 1 && SEQUENCE_PATTERN.test(keys);

/** Normalise a KeyboardEvent into the notation used by `KeyBinding.keys`. */
const describe = (event: KeyboardEvent): string => {
  if (event.key === ' ') return 'Space';

  let key = event.key;
  // Trust the character the browser actually produced. `shiftKey` is only
  // needed when a layout reports an unshifted letter for a shifted key.
  if (key.length === 1 && event.shiftKey) key = key.toUpperCase();

  if (event.ctrlKey) return `Ctrl-${key.toLowerCase()}`;
  if (event.metaKey) return `Meta-${key.toLowerCase()}`;
  if (event.altKey) return `Alt-${key.toLowerCase()}`;
  return key;
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
};

/**
 * Vim-style key dispatcher.
 *
 * Returns the pending prefix (`g`, `z`, ...) so the status bar can render it,
 * which is what makes multi-key chords feel native instead of laggy.
 */
export const useKeyboard = (bindings: KeyBinding[]): { pending: string } => {
  const [pending, setPending] = useState('');
  const pendingRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Bindings change on nearly every render (they close over state), so keep the
  // latest set in a ref and let the listener stay mounted exactly once.
  const byKey = useMemo(() => new Map(bindings.map((b) => [b.keys, b])), [bindings]);
  const byKeyRef = useRef(byKey);
  byKeyRef.current = byKey;

  const prefixes = useMemo(
    () => [...byKey.keys()].filter(isSequence),
    [byKey],
  );
  const prefixesRef = useRef(prefixes);
  prefixesRef.current = prefixes;

  const clearPending = useCallback(() => {
    clearTimeout(timerRef.current);
    pendingRef.current = '';
    setPending('');
  }, []);

  useEffect(() => {
    const arm = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        pendingRef.current = '';
        setPending('');
      }, SEQUENCE_TIMEOUT_MS);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) return;

      const lookup = byKeyRef.current;
      const typing = isTypingTarget(event.target);
      const key = describe(event);

      const attempt = (candidate: string): boolean => {
        const binding = lookup.get(candidate);
        if (!binding) return false;
        if (typing && !binding.allowInInput) return false;
        clearPending();
        binding.run();
        return true;
      };

      if (typing) {
        // While typing, only pass-through bindings (Escape) act.
        if (attempt(key)) event.preventDefault();
        return;
      }

      // Ignore browser/OS chords we do not own.
      if (event.metaKey) return;

      const candidate = pendingRef.current + key;

      if (attempt(candidate)) {
        event.preventDefault();
        return;
      }

      if (prefixesRef.current.some((sequence) => sequence.startsWith(candidate))) {
        pendingRef.current = candidate;
        setPending(candidate);
        arm();
        event.preventDefault();
        return;
      }

      // Unknown chord: drop the prefix and retry the bare key.
      clearPending();
      if (candidate !== key && attempt(key)) event.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, [clearPending]);

  return { pending };
};
