import React from 'react';
import { Terminal, Github, Bird, Rocket } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-terminal-green/30 py-6 mt-12">
      <div className="container mx-Rocket px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Terminal className="text-terminal-green" size={24} />
            <div>
              <div className="text-terminal-green font-vt323 text-xl">andev0x</div>
              <div className="text-terminal-green/60 terminal-accent text-xs">
                Terminal-inspired tech blog
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/andev0x"
              className="text-terminal-green hover-glow transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://bsky.app/profile/anvndev.bsky.social"
              className="text-terminal-green hover-glow transition-colors"
              aria-label="Bluesky"
            >
              <Bird size={20} />
            </a>
            <a
              href="https://mastodon.social/@anvndev"
              className="text-terminal-green hover-glow transition-colors"
              aria-label="Mastodon"
            >
              <Rocket size={20} />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-terminal-green/20 text-center">
          <div className="text-terminal-green/60 terminal-accent text-xs">
            © 2025 andev0x. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
