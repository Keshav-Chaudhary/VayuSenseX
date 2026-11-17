/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#04070d',
          900: '#060b13',
          850: '#0a101b',
          800: '#0d1523',
          700: '#141f33',
          600: '#1e2d48',
          500: '#2a3d60',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          glow: '#00f2fe',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        aqi: {
          good: '#10b981',
          moderate: '#f59e0b',
          poor: '#f97316',
          unhealthy: '#ef4444',
          severe: '#9333ea',
          hazardous: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};
