import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── CivilOS Unified Design System — Light Clean ──
        // Primary #1a56db / Primary dark #1e429f, anchored at 500 / 700
        // so every existing bg-primary-500 / hover:bg-primary-600 class
        // in the app automatically picks up the new brand color.
        primary: {
          50:  '#f1f5fd',
          100: '#dfe7fa',
          200: '#baccf4',
          300: '#88a7ec',
          400: '#517fe4',
          500: '#1a56db', // Primary
          600: '#1c4cbd',
          700: '#1e429f', // Primary dark
          800: '#193682',
          900: '#132963',
        },
        // Tailwind's default "slate" scale is overridden here to match
        // the CivilOS neutral palette exactly (Surface 2 / Border /
        // Text tokens), so existing classes like bg-slate-50,
        // border-slate-100, text-slate-900 etc. render the new design
        // system colors without any component changes.
        slate: {
          50:  '#f9fafb', // Surface 2
          100: '#f3f4f6',
          200: '#e5e7eb', // Border
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280', // Text muted
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827', // Text primary
          950: '#030712',
        },
        civil: {
          blue:  '#1e429f',
          steel: '#374151',
          teal:  '#0f766e',
          amber: '#d97706',
          slate: '#f9fafb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
        'panel': '0 0 0 1px rgb(0 0 0 / 0.06), 0 2px 8px rgb(0 0 0 / 0.06)',
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
      }
    },
  },
  plugins: [],
} satisfies Config
