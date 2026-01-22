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
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
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
              fontWeight: '700',
            },
            h3: {
              marginTop: '2rem',
              marginBottom: '0.75rem',
              fontWeight: '600',
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
            a: {
              color: '#0066cc',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: '#0052a3',
                textDecoration: 'underline',
              },
            },
          },
        },
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
