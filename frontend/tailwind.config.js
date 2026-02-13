/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mosaik': {
          black: '#111111',
          gray: '#BEBEBE',
          'gray-soft': '#F4F4F4',
        },
        'mosaik-dark-bg': '#0a0a0a',
        'mosaik-dark-card': '#141414',
        'mosaik-dark-border': '#262626',
      },
    },
  },
  plugins: [],
}
