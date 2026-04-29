import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cond: ['var(--font-cond)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        surface: 'var(--surface)',
        s2: 'var(--s2)',
        border: 'var(--border)',
        bd2: 'var(--bd2)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        dim: 'var(--dim)',
        lime: 'var(--lime)',
        'lime-app': 'var(--lime-app)',
        red: 'var(--red)',
        green: 'var(--green)',
        amber: 'var(--amber)',
        blue: 'var(--blue)',
      },
      borderRadius: {
        card: '12px',
        'card-lg': '14px',
      },
      animation: {
        ticker: 'ticker 32s linear infinite',
        pulse: 'pulse 1.2s ease-in-out infinite',
        breathe: 'breathe 2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease both',
      },
      keyframes: {
        ticker: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        pulse: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(0.7)' },
        },
        breathe: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
