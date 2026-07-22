/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#0f172a',
        surface: '#1e293b',
        surface2: '#273449',
        accent: '#f59e0b',
        accent2: '#22c55e',
        danger: '#ef4444',
        muted: '#94a3b8'
      }
    }
  },
  plugins: []
};
