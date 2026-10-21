/**
 * Syntax highlighting.
 *
 * Prism is used directly instead of `react-syntax-highlighter`. The wrapper
 * turns every token into a React element carrying an inline style, which costs
 * a fiber, an element and a style object per token — on a long post that is
 * thousands of objects the garbage collector has to walk, and it drags the
 * `highlight.js`/`lowlight` machinery into the bundle for no benefit. Prism can
 * emit a plain HTML string instead, which is written into the DOM once.
 *
 * Only the grammars the posts actually use are loaded. `prismjs` ships the
 * markup/css/clike/javascript core; everything below is added on top.
 */
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ini';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-nix';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';

/**
 * Aliases for the labels authors actually type in front matter / fences.
 *
 * Prism registers a few of these itself (`sh`/`shell` for bash, `ts` for
 * typescript, `yml` for yaml, `dockerfile` for docker), but the mapping is
 * spelled out here so the set does not depend on which grammars happen to be
 * loaded.
 */
const ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  yml: 'yaml',
  md: 'markdown',
  dockerfile: 'docker',
  'docker-compose': 'yaml',
  conf: 'ini',
  toml: 'ini',
};

/** Grammar name for a fence label, or `undefined` when there is no label. */
export const resolveLanguage = (language?: string): string | undefined => {
  if (!language) return undefined;
  const key = language.toLowerCase();
  return ALIASES[key] ?? key;
};

/** Whether a grammar is loaded for this label. */
export const isSupported = (language?: string): boolean => {
  const resolved = resolveLanguage(language);
  return resolved !== undefined && resolved in Prism.languages;
};

/**
 * Highlight `code` and return the HTML.
 *
 * Prism escapes the source, so the result is safe to inject as markup. The
 * tokens carry class names (`token keyword`) rather than inline styles; the
 * colours live in `.code-frame .token.*` in `src/index.css`, which keeps the
 * per-token DOM payload to a short class attribute instead of a long `style`
 * string.
 */
export const highlightCode = (code: string, language: string): string => {
  const grammar = Prism.languages[language];
  if (!grammar) return '';
  try {
    return Prism.highlight(code, grammar, language);
  } catch {
    // A grammar that throws on malformed input must not take the article down.
    return '';
  }
};
