import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const asciiArt = `

██╗              █████╗ ███╗   ██╗
╚██╗            ██╔══██╗████╗  ██║
 ╚██╗           ███████║██╔██╗ ██║
 ██╔╝           ██╔══██║██║╚██╗██║
██╔╝███████╗    ██║  ██║██║ ╚████║██╗██╗
╚═╝ ╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝

`;

const info = [
  { label: 'User', value: 'andev0x' },
  { label: 'OS', value: 'macOS' },
  { label: 'Editor', value: 'Vim' },
  { label: 'Server', value: 'Earth' },
  { label: 'Lang', value: 'TypeScript, Go, Rust, Swift, Python' },
];

function useTypingEffect(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

export const TerminalAboutMe: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const intro = ">_ Hi, I'm Andeph Nguyen! Welcome to my terminal. I'm a developer passionate about building cool things with code.";
  const typedIntro = useTypingEffect(intro, 25);

  return (
    <div className="bg-black/60 backdrop-blur-md text-green-400 font-mono p-6 rounded-lg shadow-lg max-w-xl mx-auto mt-12 border border-green-700">
      {/* Terminal header */}
      <div className="flex items-center mb-4">
        <button
          type="button"
          className="w-3 h-3 bg-red-500 rounded-full mr-2 focus:outline-none focus:ring-2 focus:ring-red-400 hover:scale-110 transition-transform"
          aria-label="Close About Me"
          onClick={onClose}
        />
        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        <span className="ml-4 text-green-300">anvndev@macbook:~$</span>
      </div>
      {/* ASCII Art */}
      <motion.pre
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-green-500 text-sm leading-none mb-4"
      >
        {asciiArt}
      </motion.pre>
      {/* Typing intro */}
      <div className="mb-4 min-h-[3em]">
        <span>{typedIntro}</span>
        <span className="animate-pulse">█</span>
      </div>
      {/* Info Table */}
      <div>
        {info.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.2 }}
            className="flex"
          >
            <span className="w-24 text-green-300">{row.label}:</span>
            <span>{row.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
