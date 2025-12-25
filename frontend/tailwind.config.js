/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'job-dark': '#121E31',    // Dark Blue background
        'job-orange': '#F7941E',  // Search button orange
      },
    },
  },
  plugins: [],
}