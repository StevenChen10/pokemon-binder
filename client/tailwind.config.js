/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pokemon: {
          red:    '#CC0000',
          yellow: '#FFCB05',
          navy:   '#1B3A6B',
          blue:   '#3D7DCA',
          light:  '#EEF2F8',
        },
      },
    },
  },
  plugins: [],
};
