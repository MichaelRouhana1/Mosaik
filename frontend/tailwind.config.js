/** @type {import('tailwindcss').Config} */
export default {
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
      },
    },
  },
  plugins: [],
}
