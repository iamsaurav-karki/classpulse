/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Role-based colors for dashboard - consistent green branding
    'bg-green-50', 'bg-slate-50',
    'text-green-600', 'text-slate-700',
    'bg-green-600', 'bg-slate-700',
    'hover:bg-green-700', 'hover:bg-slate-800',
    'hover:border-green-300', 'hover:border-slate-300',
    'hover:text-green-600', 'hover:text-slate-700',
    'focus:ring-green-500', 'focus:border-green-500',
    'focus:ring-slate-500', 'focus:border-slate-500',
    'bg-green-100', 'bg-slate-100',
    'text-green-700', 'text-slate-700',
    'border-green-600', 'border-slate-700',
    // Blue for student "Ask Question" card
    'bg-blue-600', 'hover:bg-blue-700', 'text-blue-50',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}

