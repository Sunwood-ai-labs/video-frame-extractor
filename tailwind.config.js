/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          darkest: '#011F26',
          darker: '#013A40',
          DEFAULT: '#047F8C',
          light: '#62D9CD',
          lightest: '#DCF2F0',
        }
      }
    },
  },
  plugins: [],
}
