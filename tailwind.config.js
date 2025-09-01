/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  // 保留你的 safelist（可继续补充）
  safelist: [
    'mb-4', 'flex', 'flex-wrap', 'gap-2',
    'bg-green-500', 'rounded', 'px-2',
    'text-xs', 'text-white', 'font-semibold',
    'uppercase', 'h-6',
    'text-red-600', 'text-red-700',
    'hover:text-red-900',
  ],

  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9', // 主要品牌色
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        // 和我给你的统一样式匹配
        sans: [
          'Inter var',
          'system-ui',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,.04), 0 4px 24px rgba(0,0,0,.06)',
        lift: '0 8px 30px rgba(0,0,0,.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backgroundImage: {
        glow: 'radial-gradient(600px circle at var(--x,50%) var(--y,80%), rgba(124,58,237,.10), transparent 60%)',
      },
    },
  },

  plugins: [
    typography,
    forms,
    containerQueries,
  ],
}
