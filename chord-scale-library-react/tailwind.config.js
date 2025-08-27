/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'music-dark': '#020617',
        'music-light': '#f1f5f9',
      },
      animation: {
        'particle-fade': 'particle-fade 1.5s ease-out forwards',
        'key-press': 'key-press 0.1s ease',
      },
      keyframes: {
        'particle-fade': {
          '0%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(0.1) translateY(-50px)',
          },
        },
        'key-press': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(2px)' },
        },
      },
    },
  },
  plugins: [],
}
