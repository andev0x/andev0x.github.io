import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';

const asciiArt = `
██╗              █████╗ ███╗   ██╗
╚██╗            ██╔══██╗████╗  ██║
 ╚██╗           ███████║██╔██╗ ██║
 ██╔╝           ██╔══██║██║╚██╗██║
██╔╝███████╗    ██║  ██║██║ ╚████║██╗██╗
╚═╝ ╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝
`;

const intro =
  "Hi, I'm Andeph — I build backend systems and write about the tools I lean on: Neovim, containers, and the terminal.";

const facts: Array<[string, string]> = [
  ['user', 'andev0x'],
  ['os', 'macOS'],
  ['editor', 'Neovim'],
  ['shell', 'zsh + tmux'],
  ['server', 'Earth'],
  ['stack', 'Go, Rust, TypeScript, Swift'],
];

/** Types a string out, one character per tick. Timer is always cleaned up. */
const useTyping = (text: string, speed = 22): string => {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let index = 0;
    setTyped('');
    const timer = setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return typed;
};

/**
 * Reveal offsets, in ms. The wordmark boots line by line, then the fact table
 * cascades in underneath the intro line: the intro alone takes ~2.6s to type, so
 * gating the table on it would leave most of the panel empty for most of the
 * open. Every delay is collapsed to 0 under `prefers-reduced-motion` (see
 * src/index.css), which is what keeps these items from sitting invisible while
 * their animation is skipped.
 */
const ART_AT = 120;
const ART_STEP = 70;
const FACTS_AT = 560;
const FACTS_STEP = 70;

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Body of the dialog, mounted only while it is open — `Modal` renders `null`
 * when closed, so this subtree is not in the tree at all until the first open.
 * That is what makes the typing and the cascades replay on every open; when the
 * animation lived in `AboutDialog` the intro finished typing during the app's
 * first render, behind a closed modal, and the second About was a static panel.
 */
const AboutBody: React.FC = () => {
  const typed = useTyping(intro);
  // Split for the per-line boot; the surrounding blank lines are layout only.
  const lines = asciiArt.trim().split('\n');

  return (
    <div className="px-5 py-5">
      <h2 id="about-title" className="sr-only">
        About andev0x
      </h2>

      <pre
        aria-hidden="true"
        className="mb-4 select-none overflow-x-auto font-mono text-[0.55rem] leading-[1.15] text-accent/85 sm:text-[0.7rem]"
      >
        {lines.map((line, index) => (
          <span
            key={index}
            className="animate-enter block"
            style={{ animationDelay: `${ART_AT + index * ART_STEP}ms` }}
          >
            {line}
          </span>
        ))}
      </pre>

      {/* min-h reserves the final line so the block does not jump while typing. */}
      <p className="min-h-[3.5rem] font-mono text-sm leading-relaxed text-fg-muted">
        <span className="text-accent">❯ </span>
        {typed}
        {typed.length < intro.length && (
          <span className="ml-0.5 inline-block h-4 w-2 animate-caret-blink bg-accent align-text-bottom" />
        )}
      </p>

      <dl className="mt-4 divide-y divide-border border-t border-border">
        {facts.map(([label, value], index) => (
          <div
            key={label}
            className="animate-enter flex gap-4 py-1.5 font-mono text-xs"
            style={{ animationDelay: `${FACTS_AT + index * FACTS_STEP}ms` }}
          >
            <dt className="w-20 shrink-0 text-fg-subtle">{label}</dt>
            <dd className="text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export const AboutDialog: React.FC<AboutDialogProps> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} labelledBy="about-title">
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/60" aria-hidden="true" />
        <span className="ml-2 font-mono text-xs text-fg-subtle">~/about</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md border border-border px-2 py-1 font-mono text-xs text-fg-muted transition-colors hover:border-accent/50 hover:text-fg"
      >
        close <span className="kbd ml-1">esc</span>
      </button>
    </div>

    <AboutBody />
  </Modal>
);
