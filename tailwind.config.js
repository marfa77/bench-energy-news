/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b8dfff',
          300: '#7bc5ff',
          400: '#36a7ff',
          500: '#0c8aff',
          600: '#0066cc',
          700: '#0052a3',
          800: '#064686',
          900: '#0a3c6f',
        },
      },
    },
  },
  plugins: [],
}
