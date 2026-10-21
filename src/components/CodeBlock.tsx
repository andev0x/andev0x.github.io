import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { highlightCode, isSupported, resolveLanguage } from '../utils/prism';

/**
 * How far ahead of the viewport a block starts highlighting.
 *
 * Highlighting is deferred until the block is nearly on screen: tokenising
 * every code block of a long post up front costs CPU *and* memory (one span
 * per token in the DOM) for blocks the reader may never scroll to.
 */
const PRELOAD_MARGIN = '400px 0px';

/**
 * Fenced code block.
 *
 * The body is injected as one HTML string produced by Prism (see
 * `utils/prism.ts`) rather than as a React tree of token elements. React then
 * owns exactly one node here instead of hundreds, and the tokens carry class
 * names whose colours come from CSS — see `.code-frame .token.*` in
 * `src/index.css`.
 *
 * Geometry (padding, font, alignment) belongs to `.code-frame pre` in
 * `src/index.css`. Nothing below may reintroduce a `pre[...]` style key.
 */
interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlockBase: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const resolved = resolveLanguage(language);
  const supported = isSupported(language);

  useEffect(() => {
    if (!supported || resolved === undefined) return;
    const frame = frameRef.current;
    if (!frame) return;

    // No observer (old browser, or a test environment): highlight right away.
    if (typeof IntersectionObserver === 'undefined') {
      setHtml(highlightCode(code, resolved));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setHtml(highlightCode(code, resolved));
      },
      { rootMargin: PRELOAD_MARGIN },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, [code, resolved, supported]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked (insecure context) — ignore */
    }
  }, [code]);

  return (
    <div className="code-frame group/code" ref={frameRef}>
      <div className="flex items-center justify-between border-b border-border px-4 py-1.5">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-fg-subtle">
          {resolved ?? 'text'}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-fg-subtle transition-colors duration-150 hover:bg-elevated hover:text-accent"
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>

      {supported ? (
        <pre>
          {html === null ? (
            // Not highlighted yet: the plain source, so the block is readable
            // (and searchable) before it is tokenised.
            <code className={`language-${resolved}`}>{code}</code>
          ) : (
            <code
              className={`language-${resolved}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </pre>
      ) : (
        // Unknown or absent language: same geometry, no grammar. Padding and
        // alignment come from `.code-frame pre`, so both paths line up.
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export const CodeBlock = memo(CodeBlockBase);

export type { CodeBlockProps };
