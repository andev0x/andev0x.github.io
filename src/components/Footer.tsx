import React from 'react';
import { Terminal, Github, Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-terminal-green/30 py-6 mt-12">
      <div className="container mx-auto px-4">
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
              href="https://twitter.com/anvndev"
              className="text-terminal-green hover-glow transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://anvndev.github.io"
              className="text-terminal-green hover-glow transition-colors"
              aria-label="Contact"
            >
              <Mail size={20} />
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