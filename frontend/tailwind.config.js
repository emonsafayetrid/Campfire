/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF6EC",
        ink: "#1C1B1A",
        campnavy: "#1B2A38",
        campyellow: "#FFC94D",
        camppink: "#FF6F5E",
        campgreen: "#3F9C6B",
        campblue: "#3E7CB1",
        camppurple: "#8C6FE0",
        line: "#E7DFCE",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        camp: "4px 4px 0px 0px rgba(28,27,26,1)",
        campsm: "2px 2px 0px 0px rgba(28,27,26,1)",
        card: "0 2px 10px rgba(28,27,26,0.06)",
      },
      borderRadius: {
        camp: "1.1rem",
      },
    },
  },
  plugins: [],
};
