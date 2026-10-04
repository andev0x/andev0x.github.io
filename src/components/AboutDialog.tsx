import { useEffect, useState } from 'react';
import { Modal } from './Modal';

const asciiArt = `
  ──  a n d e v 0 x  ──
`;

const intro =
  "Hi, I'm andev0x — I build backend systems and write about the tools I lean on: Neovim, containers, and the terminal.";

const facts = [
  ['user', 'andev0x'],
  ['os', 'macOS'],
  ['editor', 'Neovim'],
  ['shell', 'zsh + tmux'],
  ['server', 'Earth'],
  ['stack', 'Go, Rust, TypeScript, Swift'],
] as const;

const ART_START = 90;
const ART_ROW_STEP = 55;
const ART_COL_STEP = 11;
const SCAN_START = 140;
const FACTS_START = 1150;
const FACTS_STEP = 70;

const useTyping = (value: string, speed = 22) => {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let index = 0;

    setTyped('');

    const timer = setInterval(() => {
      index += 1;
      setTyped(value.slice(0, index));

      if (index >= value.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [value, speed]);

  return typed;
};

const getGlyphDelay = (row: number, column: number) =>
  `${ART_START + row * ART_ROW_STEP + column * ART_COL_STEP}ms`;

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const AboutBody = () => {
  const typed = useTyping(intro);
  const lines = asciiArt.trim().split('\n');

  return (
    <div className="px-5 py-5">
      <h2 id="about-title" className="sr-only">
        About andev0x
      </h2>

      <div className="relative mb-4 overflow-hidden">
        <div className="overflow-x-auto">
          <pre
            aria-hidden="true"
            className="select-none font-mono text-[0.55rem] leading-[1.15] text-accent/85 sm:text-[0.7rem]"
          >
            {lines.map((line, row) => (
              <span key={row} className="block whitespace-pre">
                {Array.from(line).map((char, column) => (
                  <span
                    key={`${row}-${column}`}
                    className="animate-glyph-in inline-block"
                    style={{ animationDelay: getGlyphDelay(row, column) }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </pre>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3
                     bg-gradient-to-r from-transparent via-accent/25 to-transparent
                     animate-glyph-scan"
          style={{ animationDelay: `${SCAN_START}ms` }}
        />
      </div>

      <p className="min-h-[3.5rem] font-mono text-sm leading-relaxed text-fg-muted">
        <span className="text-accent">❯ </span>
        {typed}

        {typed.length < intro.length && (
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-4 w-2 animate-caret-blink
                       bg-accent align-text-bottom"
          />
        )}
      </p>

      <dl className="mt-4 divide-y divide-border border-t border-border">
        {facts.map(([label, value], index) => (
          <div
            key={label}
            className="animate-enter flex gap-4 py-1.5 font-mono text-xs"
            style={{
              animationDelay: `${FACTS_START + index * FACTS_STEP}ms`,
            }}
          >
            <dt className="w-20 shrink-0 text-fg-subtle">{label}</dt>
            <dd className="text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export const AboutDialog = ({ open, onClose }: AboutDialogProps) => (
  <Modal open={open} onClose={onClose} labelledBy="about-title">
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full bg-border-strong"
          aria-hidden="true"
        />
        <span
          className="h-2.5 w-2.5 rounded-full bg-border-strong"
          aria-hidden="true"
        />
        <span
          className="h-2.5 w-2.5 rounded-full bg-accent/60"
          aria-hidden="true"
        />

        <span className="ml-2 font-mono text-xs text-fg-subtle">
          ~/about
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-md border border-border px-2 py-1 font-mono text-xs
                   text-fg-muted transition-colors
                   hover:border-accent/50 hover:text-fg"
      >
        close <span className="kbd ml-1">esc</span>
      </button>
    </div>

    <AboutBody />
  </Modal>
);
