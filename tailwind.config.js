/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B68E8',
        secondary: '#8B95F7',
        accent: '#3BD4AE',
        surface: '#F8F9FD',
        background: '#FFFFFF',
        warning: '#FFB84D',
        error: '#FF5757',
        info: '#5B68E8',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui']
      },
      borderRadius: {
        'lg': '12px',
        'DEFAULT': '8px'
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'focus': '0 0 0 3px rgba(91, 104, 232, 0.1)'
      }
    },
  },
  plugins: [],
}