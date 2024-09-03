// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

// tailwind.config.js

// eslint-disable-next-line no-undef
module.exports = {
  darkMode: "class", // Enable the 'class' mode for dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // gridColumn: {
      //   "span-2.5": "span 2.5 / span 2.5", // Custom span
      // },
      // Extend or override Tailwind CSS theme here

      screens: {
        xs: "475px",
        "md-custom": "900px",
        "lg-custom": "1200px",
        "xl-custom": "1364px",
      },
      keyframes: {
        fadeInOut: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        fadeInOut: "fadeInOut 1s linear forwards",
      },
    },
  },
  plugins: [
    // Add any Tailwind CSS plugins here
  ],
};
