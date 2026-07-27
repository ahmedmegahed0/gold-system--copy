/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold': '#C9A84C',
        'charcoal': '#1A1A1A',
        'light-gray': '#F8F9FA',
        'theme-sales': '#E63946',
        'theme-inventory': '#0077B6',
        'theme-scrap': '#2A9D8F',
        'theme-customers': '#E5A93B',
        'theme-returns': '#8338EC',
        'theme-cashflow': '#38B000',
        'theme-categories': '#F77F00',
        'theme-movements': '#4A4E69',
      },
    },
  },
  plugins: [],
}
