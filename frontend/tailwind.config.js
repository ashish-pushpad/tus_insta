/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        instagram: {
          purple: '#833AB4',
          red: '#FD1D1D',
          orange: '#F77737',
          pink: '#E1306C'
        }
      }
    },
  },
  plugins: [],
}
