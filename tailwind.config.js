/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1360px' },
    },
    extend: {
      colors: {
        // Semantic tokens backed by CSS custom properties (see src/index.css),
        // which is what makes the dark/light switch instant with no re-render.
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        elevated: 'rgb(var(--c-elevated) / <alpha-value>)',
        border: {
          DEFAULT: 'rgb(var(--c-border) / <alpha-value>)',
          strong: 'rgb(var(--c-border-strong) / <alpha-value>)',
        },
        fg: {
          DEFAULT: 'rgb(var(--c-fg) / <alpha-value>)',
          muted: 'rgb(var(--c-fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--c-fg-subtle) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          strong: 'rgb(var(--c-accent-strong) / <alpha-value>)',
          soft: 'rgb(var(--c-accent-soft) / <alpha-value>)',
        },
        'on-accent': 'rgb(var(--c-on-accent) / <alpha-value>)',
        overlay: 'rgb(var(--c-overlay) / <alpha-value>)',
      },
      fontFamily: {
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
        display: ['VT323', 'ui-monospace', 'monospace'],
        pixel: ['Press Start 2P', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        pop: 'var(--shadow-pop)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },
      keyframes: {
        enter: {
          from: { opacity: '0', transform: 'translate3d(0,8px,0)' },
          to: { opacity: '1', transform: 'none' },
        },
        pop: {
          from: { opacity: '0', transform: 'translate3d(0,6px,0) scale(0.985)' },
          to: { opacity: '1', transform: 'none' },
        },
        'pop-right': {
          from: { opacity: '0', transform: 'translate3d(12px,0,0)' },
          to: { opacity: '1', transform: 'none' },
        },
        'caret-blink': {
          '0%,50%': { opacity: '1' },
          '50.01%,100%': { opacity: '0' },
        },
        'sweep-line': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        enter: 'enter 260ms var(--ease-out) both',
        pop: 'pop 200ms var(--ease-out) both',
        'pop-right': 'pop-right 180ms var(--ease-out) both',
        'caret-blink': 'caret-blink 1.1s steps(1,end) infinite',
        'sweep-line': 'sweep-line 2.4s var(--ease-out) infinite',
      },
    },
  },
  plugins: [],
};
