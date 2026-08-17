/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        bus: {
          void: '#0b1329',
          panel: '#101a33',
          cyan: '#0284c7',
          sync: '#10b981',
          warn: '#f59e0b',
          fault: '#ef4444',
        },
      },
      fontFamily: {
        display: ['Rajdhani', '"Noto Sans SC"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', '"Noto Sans SC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        bus: '0.28em',
      },
    },
  },
  plugins: [],
}
