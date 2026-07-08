/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        surface: "#f5f7fa",
        border: "#e5e9f0",
        accent: "#1e63d0",
        "accent-light": "#2fa8e6",
        "text-primary": "#0e2a5c",
        "text-secondary": "#5b6b84",
      },
    },
  },
  plugins: [],
};
