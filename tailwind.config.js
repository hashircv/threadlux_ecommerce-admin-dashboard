/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1e2528",
        muted: "#647076",
        line: "#d8dedb",
        page: "#edf1ee",
        brand: "#1f7a5f",
        brandDark: "#155a46",
        nav: "#223136",
      },
    },
  },
  plugins: [],
};
