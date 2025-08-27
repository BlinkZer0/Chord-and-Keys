/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg-body)",
        text: "var(--text-body)",
        brand: {
          50: "#e9f5ff",
          100: "#d8ecff",
          200: "#a9d8ff",
          300: "#77c4ff",
          400: "#4ab0ff",
          500: "#1e9bff",
          600: "#0b7ddb",
          700: "#065ea8",
          800: "#064a82",
          900: "#073a65",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,.12)",
        card: "0 8px 24px rgba(0,0,0,.18)",
      },
    },
  },
  darkMode: ["class", "[data-theme='dark']"],
};

