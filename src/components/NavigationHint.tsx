import React from 'react';

interface NavigationHintProps {
  toggleMode?: boolean;
}

const NavigationHint: React.FC<NavigationHintProps> = ({ toggleMode = false }) => {
  if (toggleMode) {
    return (
      <div className="text-center text-terminal-green/70 text-base font-vt323 mb-4 bg-terminal-green/10 border border-terminal-green/30 rounded px-4 py-2">
        <span className="text-terminal-green font-bold">TOGGLE MODE:</span>{' '}
        <span className="terminal-accent">j</span>/<span className="terminal-accent">k</span> or <span className="terminal-accent">Tab</span>=select |{' '}
        <span className="terminal-accent">Enter</span>=open |{' '}
        <span className="terminal-accent">Esc</span>=exit
      </div>
    );
  }

  return (
    <div className="text-center text-terminal-green/70 text-base font-vt323 mb-4">
      <span className="terminal-accent">c</span>=categories |{' '}
      <span className="terminal-accent">t</span>=toggle |{' '}
      <span className="terminal-accent">j</span>/<span className="terminal-accent">k</span>=move |{' '}
      <span className="terminal-accent">gg</span>/<span className="terminal-accent">G</span>=top/end |{' '}
      <span className="terminal-accent">/</span>=search
    </div>
  );
};

export default NavigationHint;
