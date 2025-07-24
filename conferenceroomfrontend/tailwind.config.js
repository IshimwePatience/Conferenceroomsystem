/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: "640px",
        md: "768px", 
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      screens: {
        'xs': '475px',
        'small-laptop': {'min': '768px', 'max': '1023px'},
        'tiny-laptop': {'min': '768px', 'max': '900px'},
        'small-mobile': {'max': '640px'},
        'tiny-mobile': {'max': '480px'},
        'micro-mobile': {'max': '360px'},
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        'form-xs': ['0.75rem', '1rem'],
        'form-sm': ['0.875rem', '1.25rem'],
        'form-base': ['1rem', '1.5rem'],
        'form-lg': ['1.125rem', '1.75rem'],
        'mobile-xs': ['0.7rem', '1rem'],
        'mobile-sm': ['0.75rem', '1.1rem'],
        'mobile-base': ['0.8rem', '1.2rem'],
      },
      maxWidth: {
        'form-sm': '20rem',
        'form-md': '24rem',
        'form-lg': '28rem',
      }
    },
  },
  plugins: [
    function({ addBase, addUtilities, theme }) {
      addBase({
        '@media (max-width: 360px)': {
          'input, button, select, textarea': {
            fontSize: '0.7rem !important',
            padding: '0.3rem 0.5rem !important',
            minHeight: '2.2rem !important',
          },
          'h1': {
            fontSize: '1.25rem !important',
          },
          'h2': {
            fontSize: '1.1rem !important',
          },
        },
        '@media (min-width: 361px) and (max-width: 480px)': {
          'input, button, select, textarea': {
            fontSize: '0.75rem !important',
            padding: '0.35rem 0.6rem !important',
            minHeight: '2.5rem !important',
          },
          'h1': {
            fontSize: '1.5rem !important',
          },
          'h2': {
            fontSize: '1.25rem !important',
          },
          '.container, .max-w-md, .max-w-sm': {
            maxWidth: '95vw !important',
            padding: '0.5rem !important',
          }
        },
        '@media (min-width: 481px) and (max-width: 640px)': {
          'input, button, select, textarea': {
            fontSize: '0.8rem !important',
            padding: '0.4rem 0.75rem !important',
          },
        },
        '@media (min-width: 768px) and (max-width: 1023px)': {
          'input, button, select, textarea': {
            fontSize: '0.875rem !important',
            padding: '0.5rem 0.75rem !important',
          },
          'h1': {
            fontSize: '1.875rem !important',
          },
          'h2': {
            fontSize: '1.5rem !important',
          },
          '.container, .max-w-md, .max-w-sm': {
            maxWidth: '20rem !important',
          }
        },
        '@media (min-width: 768px) and (max-width: 900px)': {
          'input, button, select, textarea': {
            fontSize: '0.8rem !important',
            padding: '0.4rem 0.6rem !important',
          }
        }
      });

      addUtilities({
        '.form-responsive': {
          '@apply max-w-form-sm md:max-w-form-md lg:max-w-form-lg': {},
        },
        '.input-responsive': {
          '@apply text-form-sm md:text-form-base lg:text-form-lg': {},
          '@apply px-3 py-2 md:px-4 md:py-2 lg:px-4 lg:py-3': {},
        },
        '.button-responsive': {
          '@apply text-form-sm md:text-form-base lg:text-form-lg': {},
          '@apply px-4 py-2 md:px-4 md:py-2 lg:px-4 lg:py-3': {},
        },
        '.text-responsive': {
          '@apply text-form-sm md:text-form-base lg:text-form-lg': {},
        },
        '.small-laptop:text-compact': {
          fontSize: '0.875rem !important',
        },
        '.small-laptop:p-compact': {
          padding: '0.5rem 0.75rem !important',
        }
      });
    }
  ],
}