import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dce8ff',
          200: '#bdd0ff',
          300: '#90aeff',
          400: '#6080ff',
          500: '#1d4ed8',
          600: '#1a42c4',
          700: '#1535a0',
          800: '#102880',
          900: '#0c1d5e',
        },
        civil: {
          blue: '#0c1d5e',
          steel: '#334155',
          teal: '#0f766e',
          amber: '#b45309',
          slate: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
        'panel': '0 0 0 1px rgb(0 0 0 / 0.06), 0 2px 8px rgb(0 0 0 / 0.06)',
      }
    },
  },
  plugins: [],
} satisfies Config
