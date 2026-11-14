/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c',
        surface: '#121216',
        border: '#27272a',
        primary: '#6366f1',
      }
    },
  },
  plugins: [],
}
