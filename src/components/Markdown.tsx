import React, { isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { slugify, uniqueSlug } from '../utils/toc';
import { scrollToId } from '../utils/scroll';

const flatten = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flatten).join('');
  if (isValidElement(node)) return flatten((node.props as { children?: ReactNode }).children);
  return '';
};

/**
 * Heading with a permalink anchor. Generated ids make sections linkable and
 * give `scroll-margin-top` something to work against for the sticky header.
 * Duplicate titles get suffixed (`overview`, `overview-1`, …) via the same
 * slugger the table of contents uses, so TOC links always land.
 */
const heading =
  (Tag: 'h1' | 'h2' | 'h3' | 'h4', seen: Map<string, number>) =>
  ({ children, node: _node, ...rest }: { children?: ReactNode; node?: unknown }) => {
    const text = flatten(children);
    const base = slugify(text);
    const id = base ? uniqueSlug(base, seen) : undefined;

    return (
      <Tag id={id || undefined} {...rest} className="group/head">
        {children}
        {id && (
          <a
            href={`#${id}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToId(id);
            }}
            aria-label={`Permalink to ${text}`}
            className="ml-2 select-none align-middle text-accent/0 no-underline transition-colors duration-150 group-hover/head:text-accent/70 focus-visible:text-accent"
          >
            #
          </a>
        )}
      </Tag>
    );
  };

/**
 * Markdown renderer. Loaded via `React.lazy` from PostDetail so that
 * react-markdown + the Prism grammars stay out of the initial bundle.
 */
export const Markdown: React.FC<{ content: string }> = ({ content }) => {
  // Fresh slug scope on every render. The map is mutated as headings render,
  // so it must never survive across renders (a `useMemo`-persisted map would
  // hand out `overview-1`, `overview-2`, … on each re-render while the TOC —
  // recomputed purely from `content` — still links to `overview`, leaving
  // every TOC click pointing at an id that no longer exists).
  const seen = new Map<string, number>();
  const h1 = heading('h1', seen);
  const h2 = heading('h2', seen);
  const h3 = heading('h3', seen);
  const h4 = heading('h4', seen);

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // `pre` consumes every fenced block, which leaves `code` to render
          // inline spans only — cleaner than sniffing an `inline` prop, which
          // react-markdown v9+ no longer provides.
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children;
            if (isValidElement(child)) {
              const { className, children: body } = child.props as {
                className?: string;
                children?: ReactNode;
              };
              const match = /language-([\w+-]+)/.exec(className ?? '');
              // `flatten`, not `String()`: a code body that splits into several
              // children (inline markup, entities) would otherwise be joined with
              // commas and highlight as one nonsense token.
              return <CodeBlock code={flatten(body).replace(/\n$/, '')} language={match?.[1]} />;
            }
            return <pre>{children}</pre>;
          },
          code: ({ children, node: _node, ...rest }) => (
            <code {...rest}>{children}</code>
          ),
          h1,
          h2,
          h3,
          h4,
        a: ({ children, node: _node, ...rest }) => {
          const href = typeof rest.href === 'string' ? rest.href : '';
          const external = /^https?:\/\//i.test(href);
          // Same-page anchors (`#section`) must scroll without replacing the
          // `#/post/<id>` route — see `scrollToId`.
          if (!external && href.startsWith('#') && href.length > 1) {
            const target = decodeURIComponent(href.slice(1));
            return (
              <a
                {...rest}
                href={href}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToId(target);
                }}
              >
                {children}
              </a>
            );
          }
          return (
            <a {...rest} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}>
              {children}
            </a>
          );
        },
        img: ({ node: _node, ...rest }) => (
          <img {...rest} loading="lazy" decoding="async" alt={rest.alt ?? ''} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
};

export default Markdown;
