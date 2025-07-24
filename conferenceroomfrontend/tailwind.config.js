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
        sm: '1.5rem',
        md: '2rem',
        lg: '3rem',
        xl: '4rem',
        '2xl': '5rem',
      },
    },
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // SPECIFIC FIX: For 1920×1080 @ 150% scaling (~1280px CSS width)
        'scaled-desktop': '1200px', // Catches your scaled display earlier
      },
      fontSize: {
        // Larger base sizes to compensate for scaling
        'scaled-sm': ['1rem', '1.4rem'],     // Bigger than normal sm
        'scaled-base': ['1.125rem', '1.6rem'], // Bigger than normal base
        'scaled-lg': ['1.25rem', '1.75rem'],   // Bigger than normal lg
        'scaled-xl': ['1.5rem', '2rem'],       // Bigger than normal xl
        'scaled-2xl': ['1.875rem', '2.25rem'], // Bigger than normal 2xl
      },
      spacing: {
        // Larger spacing for scaled displays
        'scaled-2': '0.625rem',  // 10px instead of 8px
        'scaled-3': '0.875rem',  // 14px instead of 12px
        'scaled-4': '1.125rem',  // 18px instead of 16px
        'scaled-6': '1.75rem',   // 28px instead of 24px
        'scaled-8': '2.25rem',   // 36px instead of 32px
      },
      maxWidth: {
        'scaled-form': '26rem', // Larger form containers
      },
    },
  },
  plugins: [
    function({ addComponents, addUtilities, theme }) {
      // MAIN COMPONENTS: Optimized for 1920×1080 @ 150% scaling
      addComponents({
        // Form container that works on your scaled display
        '.form-scaled': {
          width: '100%',
          maxWidth: theme('maxWidth.scaled-form'),
          margin: '0 auto',
          padding: theme('spacing.scaled-6'),
          '@media (min-width: 1200px)': {
            maxWidth: '30rem', // Even larger on your display
            padding: theme('spacing.scaled-8'),
          },
        },
        
        // Input fields optimized for scaling
        '.input-scaled': {
          width: '100%',
          padding: `${theme('spacing.scaled-3')} ${theme('spacing.scaled-4')}`,
          fontSize: theme('fontSize.scaled-base[0]'),
          lineHeight: theme('fontSize.scaled-base[1]'),
          borderRadius: theme('borderRadius.lg'),
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          transition: 'all 0.3s ease',
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '&:focus': {
            outline: 'none',
            borderColor: 'rgba(6, 182, 212, 0.5)',
            boxShadow: '0 0 0 2px rgba(6, 182, 212, 0.2)',
          },
          // SPECIFIC FIX: Make inputs larger on your scaled display
          '@media (min-width: 1200px)': {
            padding: `${theme('spacing.scaled-4')} ${theme('spacing.scaled-6')}`,
            fontSize: theme('fontSize.scaled-lg[0]'),
            lineHeight: theme('fontSize.scaled-lg[1]'),
          },
        },
        
        // Button optimized for scaling
        '.button-scaled': {
          width: '100%',
          padding: `${theme('spacing.scaled-3')} ${theme('spacing.scaled-4')}`,
          fontSize: theme('fontSize.scaled-base[0]'),
          lineHeight: theme('fontSize.scaled-base[1]'),
          fontWeight: '500',
          borderRadius: theme('borderRadius.lg'),
          background: 'linear-gradient(to right, #9333ea, #2563eb, #06b6d4)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 25px rgba(147, 51, 234, 0.25)',
          },
          // SPECIFIC FIX: Make buttons larger on your scaled display
          '@media (min-width: 1200px)': {
            padding: `${theme('spacing.scaled-4')} ${theme('spacing.scaled-6')}`,
            fontSize: theme('fontSize.scaled-lg[0]'),
            lineHeight: theme('fontSize.scaled-lg[1]'),
          },
        },
      });

      // UTILITIES: Helper classes for scaled displays
      addUtilities({
        // Text sizes for scaled displays
        '.text-scaled-sm': {
          fontSize: theme('fontSize.scaled-sm[0]'),
          lineHeight: theme('fontSize.scaled-sm[1]'),
        },
        '.text-scaled-base': {
          fontSize: theme('fontSize.scaled-base[0]'),
          lineHeight: theme('fontSize.scaled-base[1]'),
        },
        '.text-scaled-lg': {
          fontSize: theme('fontSize.scaled-lg[0]'),
          lineHeight: theme('fontSize.scaled-lg[1]'),
        },
        '.text-scaled-xl': {
          fontSize: theme('fontSize.scaled-xl[0]'),
          lineHeight: theme('fontSize.scaled-xl[1]'),
        },
        '.text-scaled-2xl': {
          fontSize: theme('fontSize.scaled-2xl[0]'),
          lineHeight: theme('fontSize.scaled-2xl[1]'),
        },
        
        // Spacing for scaled displays
        '.space-scaled-y > * + *': {
          marginTop: theme('spacing.scaled-4'),
        },
        '.gap-scaled': {
          gap: theme('spacing.scaled-4'),
        },
        
        // Padding helpers
        '.p-scaled': {
          padding: theme('spacing.scaled-4'),
        },
        '.px-scaled': {
          paddingLeft: theme('spacing.scaled-4'),
          paddingRight: theme('spacing.scaled-4'),
        },
        '.py-scaled': {
          paddingTop: theme('spacing.scaled-4'),
          paddingBottom: theme('spacing.scaled-4'),
        },
      });
    }
  ],
}