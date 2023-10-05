/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        lato: ["Lato", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
      },
      screens: {
        xs: "400px",
      },
    },
  },
  plugins: [],
};
