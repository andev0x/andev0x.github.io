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

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ open, onClose }) => {
  const typed = useTyping(intro);

  return (
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

      <div className="px-5 py-5">
        <h2 id="about-title" className="sr-only">
          About andev0x
        </h2>

        <pre
          aria-hidden="true"
          className="mb-4 select-none overflow-x-auto font-mono text-[0.55rem] leading-[1.15] text-accent/85 sm:text-[0.7rem]"
        >
          {asciiArt}
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
          {facts.map(([label, value]) => (
            <div key={label} className="flex gap-4 py-1.5 font-mono text-xs">
              <dt className="w-20 shrink-0 text-fg-subtle">{label}</dt>
              <dd className="text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Modal>
  );
};
