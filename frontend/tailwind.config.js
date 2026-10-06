/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#09090b",
          card: "#18181b",
          accent: "#27272a",
          light: "#fafafa"
        }
      }
    },
  },
  plugins: [],
}