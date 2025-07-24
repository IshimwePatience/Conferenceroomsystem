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
        'small-laptop': {'min': '768px', 'max': '1023px'}, // Target small laptops specifically
        'tiny-laptop': {'min': '768px', 'max': '900px'},   // Very small laptops
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        // Custom font sizes that work better across screen sizes
        'form-xs': ['0.75rem', '1rem'],
        'form-sm': ['0.875rem', '1.25rem'],
        'form-base': ['1rem', '1.5rem'],
        'form-lg': ['1.125rem', '1.75rem'],
      },
      maxWidth: {
        // Custom container sizes
        'form-sm': '20rem',
        'form-md': '24rem',
        'form-lg': '28rem',
      }
    },
  },
  plugins: [
    // Custom plugin to add global responsive utilities
    function({ addBase, addUtilities, theme }) {
      addBase({
        // Global base styles that automatically apply
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
        // Utility classes you can use in components
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
        // Small laptop specific utilities
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