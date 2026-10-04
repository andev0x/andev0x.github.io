import React, { useCallback, useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import lua from 'react-syntax-highlighter/dist/esm/languages/prism/lua';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import nix from 'react-syntax-highlighter/dist/esm/languages/prism/nix';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

/*
 * Only the grammars used by the posts are registered. The default `Prism`
 * export bundles ~300 languages, which dominated the bundle size.
 */
const GRAMMARS = { bash, docker, ini, javascript, json, lua, markdown, nix, typescript, yaml };

for (const [name, grammar] of Object.entries(GRAMMARS)) {
  SyntaxHighlighter.registerLanguage(name, grammar);
}

/** Aliases for the labels authors actually type in front matter / fences. */
const ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  js: 'javascript',
  ts: 'typescript',
  jsx: 'javascript',
  tsx: 'typescript',
  yml: 'yaml',
  md: 'markdown',
  dockerfile: 'docker',
  'docker-compose': 'yaml',
  conf: 'ini',
  toml: 'ini',
};

/**
 * Token colours reference the theme's CSS custom properties, so a single style
 * object renders correctly in both light and dark mode with no duplication.
 *
 * Only token types live here. Geometry — padding, font, alignment — belongs to
 * `.code-frame pre` in src/index.css: Prism themes ship a root `pre` rule with
 * `padding: 0`, and an inline style always outranks a class, so that root rule
 * silently overrode the frame's padding and left code flush against the left
 * edge. Nothing below may reintroduce a `pre[...]` key.
 */
const STYLE = {
  comment: { color: 'rgb(var(--c-syn-comment))', fontStyle: 'italic' },
  prolog: { color: 'rgb(var(--c-syn-comment))' },
  doctype: { color: 'rgb(var(--c-syn-comment))' },
  cdata: { color: 'rgb(var(--c-syn-comment))' },
  punctuation: { color: 'rgb(var(--c-syn-punct))' },
  operator: { color: 'rgb(var(--c-syn-punct))' },
  entity: { color: 'rgb(var(--c-syn-attr))' },
  url: { color: 'rgb(var(--c-syn-attr))' },
  variable: { color: 'rgb(var(--c-syn-attr))' },
  constant: { color: 'rgb(var(--c-syn-number))' },
  symbol: { color: 'rgb(var(--c-syn-number))' },
  deleted: { color: 'rgb(var(--c-syn-number))' },
  number: { color: 'rgb(var(--c-syn-number))' },
  boolean: { color: 'rgb(var(--c-syn-number))' },
  string: { color: 'rgb(var(--c-syn-string))' },
  char: { color: 'rgb(var(--c-syn-string))' },
  builtin: { color: 'rgb(var(--c-syn-string))' },
  inserted: { color: 'rgb(var(--c-syn-string))' },
  regex: { color: 'rgb(var(--c-syn-string))' },
  important: { color: 'rgb(var(--c-syn-attr))', fontWeight: 700 },
  keyword: { color: 'rgb(var(--c-syn-keyword))' },
  atrule: { color: 'rgb(var(--c-syn-keyword))' },
  'attr-name': { color: 'rgb(var(--c-syn-attr))' },
  selector: { color: 'rgb(var(--c-syn-attr))' },
  property: { color: 'rgb(var(--c-syn-attr))' },
  tag: { color: 'rgb(var(--c-syn-keyword))' },
  function: { color: 'rgb(var(--c-syn-fn))' },
  'class-name': { color: 'rgb(var(--c-syn-fn))' },
  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
};

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const resolved = language ? ALIASES[language.toLowerCase()] ?? language.toLowerCase() : undefined;
  const supported = resolved !== undefined && resolved in GRAMMARS;

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
    <div className="code-frame group/code">
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
        <SyntaxHighlighter
          language={resolved}
          style={STYLE}
          PreTag="pre"
          useInlineStyles
          // Only the background is set here. Without it the library falls back to
          // its own hard-coded `#fff` pre style, which would blow out the dark
          // theme. Padding, font and alignment stay in CSS.
          customStyle={{ background: 'transparent' }}
        >
          {code}
        </SyntaxHighlighter>
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
