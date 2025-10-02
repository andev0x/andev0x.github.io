import React from 'react';

const NavigationHint: React.FC = () => {
  return (
    <div className="text-center text-terminal-green/70 text-base font-vt323 mb-4">
      <span className="terminal-accent">j</span>/<span className="terminal-accent">k</span>=move | <span className="terminal-accent">gg</span>/<span className="terminal-accent">G</span>=top/end | <span className="terminal-accent">/</span>=search
    </div>
  );
};

export default NavigationHint;
