import React, { createContext, isValidElement, memo, useContext, useMemo, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { scrollToId } from '../utils/scroll';
import type { TocEntry } from '../utils/toc';

const flatten = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flatten).join('');
  if (isValidElement(node)) return flatten((node.props as { children?: ReactNode }).children);
  return '';
};

/**
 * Anchor ids by source line.
 *
 * The ids are computed once, from the raw markdown, and handed to the
 * renderer through this context. A heading therefore gets its id by looking
 * up its own line — a pure function of the document — instead of by taking
 * the next free slug from a counter that is consumed in render order. Render
 * order is not something a component can rely on: React may render a tree
 * twice, may re-render one heading without its siblings, and may throw a
 * render away entirely. Every one of those makes a counter hand out
 * `overview-1` where the table of contents still says `overview`, and the
 * link goes nowhere.
 */
const HeadingIdsContext = createContext<Map<number, string>>(new Map());

/**
 * Heading with a permalink anchor. Generated ids make sections linkable and
 * give `scroll-margin-top` something to work against for the sticky header.
 * Duplicate titles get suffixed (`overview`, `overview-1`, …) by the same
 * slugger the table of contents uses, so TOC links always land.
 */
const heading =
  (Tag: 'h1' | 'h2' | 'h3' | 'h4') =>
  ({ children, node, ...rest }: { children?: ReactNode; node?: unknown }) => {
    const ids = useContext(HeadingIdsContext);
    const line = (node as { position?: { start?: { line?: number } } } | undefined)?.position?.start
      ?.line;
    const id = line === undefined ? undefined : ids.get(line);

    return (
      <Tag id={id} {...rest} className="group/head">
        {children}
        {id && (
          <a
            href={`#${id}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToId(id);
            }}
            aria-label={`Permalink to ${flatten(children)}`}
            className="ml-2 select-none align-middle text-accent/0 no-underline transition-colors duration-150 group-hover/head:text-accent/70 focus-visible:text-accent"
          >
            #
          </a>
        )}
      </Tag>
    );
  };

/**
 * Fenced code blocks.
 *
 * Hoisted to module scope on purpose. React compares component *types* by
 * identity, so a renderer that is a fresh function on every render makes
 * React throw the old subtree away and mount a new one. A code block is the
 * most expensive thing on the page — Prism tokenises it into hundreds of
 * token spans — so remounting one redoes all of that work. A stable
 * identity means React reuses the existing DOM.
 */
const pre: Components['pre'] = ({ children }) => {
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
};

/** Inline code. `pre` consumes every fenced block, so `code` is inline only. */
const code: Components['code'] = ({ children, node: _node, ...rest }) => (
  <code {...rest}>{children}</code>
);

/**
 * Links.
 *
 * Same-page anchors (`#section`) must scroll without replacing the
 * `#/post/<id>` route — see `scrollToId`.
 */
const link: Components['a'] = ({ children, node: _node, ...rest }) => {
  const href = typeof rest.href === 'string' ? rest.href : '';
  const external = /^https?:\/\//i.test(href);
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
};

const image: Components['img'] = ({ node: _node, ...rest }) => (
  <img {...rest} loading="lazy" decoding="async" alt={rest.alt ?? ''} />
);

/**
 * The renderer table, at module scope.
 *
 * Every entry is a stable identity, so React reuses the existing DOM when the
 * article re-renders instead of unmounting and rebuilding it. A rebuilt
 * article means a rebuilt markdown tree, a rebuilt DOM and a rebuilt set of
 * highlighted code blocks — all of it garbage the collector then has to walk.
 */
const COMPONENTS: Components = {
  pre,
  code,
  h1: heading('h1'),
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  a: link,
  img: image,
};

/**
 * The remark plugins, at module scope.
 *
 * `react-markdown` builds its processor from this list on every render, so a
 * list that is created per render means a new processor per render — and a
 * new processor means the markdown is parsed again.
 */
const REMARK_PLUGINS = [remarkGfm];

/**
 * Markdown renderer. Loaded via `React.lazy` from PostDetail so that
 * react-markdown + the Prism grammars stay out of the initial bundle.
 */
const MarkdownBase: React.FC<{ content: string; headings: TocEntry[] }> = ({
  content,
  headings,
}) => {
  const ids = useMemo(() => new Map(headings.map((entry) => [entry.line, entry.id])), [headings]);

  return (
    <HeadingIdsContext.Provider value={ids}>
      <div className="prose">
        <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={COMPONENTS}>
          {content}
        </ReactMarkdown>
      </div>
    </HeadingIdsContext.Provider>
  );
};

export const Markdown = memo(MarkdownBase);
export default Markdown;
