import React from 'react';
import { Github, Rss, Send } from 'lucide-react';

const LINKS = [
  { href: 'https://github.com/andev0x', label: 'GitHub', icon: Github },
  { href: 'https://bsky.app/profile/anvndev.bsky.social', label: 'Bluesky', icon: Send },
  { href: 'https://mastodon.social/@anvndev', label: 'Mastodon', icon: Rss },
];

export const Footer: React.FC = () => (
  <footer className="mt-16 border-t border-border">
    <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
      <div>
        <p className="font-display text-xl text-fg">andev0x</p>
        <p className="mt-0.5 font-mono text-[0.68rem] text-fg-subtle">
          keyboard-first notes on software and systems
        </p>
      </div>

      <ul className="flex items-center gap-1">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={label}
              className="grid h-9 w-9 place-items-center rounded-md border border-transparent text-fg-muted transition-colors duration-150 hover:border-border hover:bg-elevated hover:text-accent"
            >
              <Icon size={16} strokeWidth={1.75} />
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div className="container pb-10">
      <p className="font-mono text-[0.65rem] text-fg-subtle">
        © {new Date().getFullYear()} andev0x · built with react + tailwind
      </p>
    </div>
  </footer>
);
