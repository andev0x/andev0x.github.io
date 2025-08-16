import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface HintProps {
  element: HTMLElement;
  hintKey: string;
}

export const Hint: React.FC<HintProps> = ({ element, hintKey }) => {
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  useEffect(() => {
    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX - 20, // Adjust left position
      });
    };

    updatePosition();

    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [element]);

  return ReactDOM.createPortal(
    <div
      className="absolute bg-terminal-yellow text-terminal-black p-1 rounded text-xs font-bold z-50 pointer-events-none"
      style={{ top: position.top, left: position.left }}
    >
      {hintKey}
    </div>,
    document.body
  );
};
