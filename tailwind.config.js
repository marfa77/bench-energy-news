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
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            h2: {
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            },
            h3: {
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            blockquote: {
              borderLeftColor: '#0066cc',
              backgroundColor: '#f9fafb',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
            },
            code: {
              color: '#d63384',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
