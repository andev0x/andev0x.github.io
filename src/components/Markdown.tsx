import React, { isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

const flatten = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flatten).join('');
  if (isValidElement(node)) return flatten((node.props as { children?: ReactNode }).children);
  return '';
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Heading with a permalink anchor. Generated ids make sections linkable and
 * give `scroll-margin-top` something to work against for the sticky header.
 */
const heading =
  (Tag: 'h1' | 'h2' | 'h3' | 'h4') =>
  ({ children, node: _node, ...rest }: { children?: ReactNode; node?: unknown }) => {
    const text = flatten(children);
    const id = slugify(text);

    return (
      <Tag id={id || undefined} {...rest} className="group/head">
        {children}
        {id && (
          <a
            href={`#${id}`}
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
export const Markdown: React.FC<{ content: string }> = ({ content }) => (
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
            return <CodeBlock code={String(body ?? '').replace(/\n$/, '')} language={match?.[1]} />;
          }
          return <pre>{children}</pre>;
        },
        code: ({ children, node: _node, ...rest }) => (
          <code {...rest}>{children}</code>
        ),
        h1: heading('h1'),
        h2: heading('h2'),
        h3: heading('h3'),
        h4: heading('h4'),
        a: ({ children, node: _node, ...rest }) => {
          const href = typeof rest.href === 'string' ? rest.href : '';
          const external = /^https?:\/\//i.test(href);
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

export default Markdown;
