/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eink-black': '#1a1a1a',
        'eink-dark': '#333333',
        'eink-gray': '#666666',
        'eink-light': '#cccccc',
        'eink-white': '#e8e8e8',
        'eink-paper': '#f5f5f5',
      },
      fontFamily: {
        'mono': ['Courier New', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}
