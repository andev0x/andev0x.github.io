/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'terminal-black': '#0a0a0a',
        'terminal-green': '#00FF00',
        'terminal-green-dim': '#00CC00',
        'terminal-green-bright': '#00FF88',
        'terminal-gray': '#333333',
        'terminal-gray-light': '#666666',
        // Enhanced code block colors for better readability
        'code-bg': '#1a1a1a',
        'code-text': '#e0e0e0',
        'code-border': '#333333',
        'code-comment': '#888888',
        'code-keyword': '#00FF88',
        'code-string': '#88FF88',
        'code-number': '#FFFF88',
      },
      fontFamily: {
        'vt323': ['VT323', 'monospace'],
        'press-start': ['Press Start 2P', 'monospace'],
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { opacity: '0.8', textShadow: '0 0 10px #00FF00' },
          '100%': { opacity: '1', textShadow: '0 0 20px #00FF00, 0 0 30px #00FF00' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow': {
          '0%': { textShadow: '0 0 5px #00FF00' },
          '100%': { textShadow: '0 0 20px #00FF00, 0 0 30px #00FF00' },
        },
      },
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'desktop': '1024px',
      },
    },
  },
  plugins: [],
};