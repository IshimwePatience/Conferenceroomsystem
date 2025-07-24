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
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // CRITICAL: Simple fix for your 1920×1080 @ 150% scaling
        'scaled': '1200px',
        // Use standard breakpoints instead of custom ones
        '3xl': '1920px',
      },
      
      // SIMPLE FONT SIZES - Not too aggressive
      fontSize: {
        // Keep standard sizes
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        
        // CONTROLLED responsive sizes - not too big/small
        'responsive-sm': ['0.9rem', { lineHeight: '1.3rem' }],
        'responsive-base': ['1.05rem', { lineHeight: '1.6rem' }],
        'responsive-lg': ['1.2rem', { lineHeight: '1.8rem' }],
        'responsive-xl': ['1.4rem', { lineHeight: '2rem' }],
        'responsive-2xl': ['1.7rem', { lineHeight: '2.3rem' }],
      },
      
      // CONTROLLED SPACING - Not too aggressive
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        // Simple responsive spacing
        'r-1': '0.3rem',
        'r-2': '0.6rem', 
        'r-3': '0.9rem',
        'r-4': '1.2rem',
        'r-5': '1.5rem',
        'r-6': '1.8rem',
        'r-8': '2.4rem',
      },
      
      maxWidth: {
        'form-sm': '22rem',
        'form-md': '26rem', 
        'form-lg': '30rem',
      },
    },
  },
  plugins: [
    function({ addComponents, addUtilities, theme }) {
      
      // SIMPLE COMPONENTS - Controlled sizing
      addComponents({
        // Simple responsive form
        '.simple-form': {
          width: '100%',
          maxWidth: theme('maxWidth.form-sm'),
          margin: '0 auto',
          padding: theme('spacing.6'),
          
          // Tablet and small laptop (md breakpoint = 768px+) - EVEN MORE COMPACT
          '@media (min-width: 768px)': {
            maxWidth: '16rem', // Even smaller container
            padding: theme('spacing.2'), // Even tighter padding
          },
          
          // Desktop and your 1920×1080 @ 150% display (lg breakpoint = 1024px+)
          '@media (min-width: 1024px)': {
            maxWidth: theme('maxWidth.form-md'),
            padding: theme('spacing.6'),
          },
          
          // Your scaled display (1200px+)
          '@media (min-width: 1200px)': {
            maxWidth: theme('maxWidth.form-md'),
            padding: theme('spacing.8'),
          },
          
          // Large screens
          '@media (min-width: 1920px)': {
            maxWidth: theme('maxWidth.form-lg'),
          },
        },
        
        // FLUID responsive input - scales smoothly across all screen sizes
        '.simple-input': {
          width: '100%',
          padding: 'clamp(0.5rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.25rem)', // Fluid padding
          fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)', // Fluid text size
          lineHeight: '1.5',
          borderRadius: 'clamp(0.375rem, 1vw, 0.75rem)', // Fluid border radius
          transition: 'all 0.3s ease',
        },
        
        // FLUID responsive button - scales smoothly across all screen sizes
        '.simple-button': {
          width: '100%',
          padding: 'clamp(0.5rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.25rem)', // Fluid padding
          fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)', // Fluid text size
          fontWeight: '500',
          lineHeight: '1.5',
          borderRadius: 'clamp(0.375rem, 1vw, 0.75rem)', // Fluid border radius
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      });

      // SIMPLE UTILITIES
      addUtilities({
        '.text-responsive-sm': { 
          fontSize: theme('fontSize.responsive-sm[0]'),
          lineHeight: theme('fontSize.responsive-sm[1]'),
        },
        '.text-responsive-base': { 
          fontSize: theme('fontSize.responsive-base[0]'),
          lineHeight: theme('fontSize.responsive-base[1]'),
        },
        '.text-responsive-lg': { 
          fontSize: theme('fontSize.responsive-lg[0]'),
          lineHeight: theme('fontSize.responsive-lg[1]'),
        },
        '.text-responsive-xl': { 
          fontSize: theme('fontSize.responsive-xl[0]'),
          lineHeight: theme('fontSize.responsive-xl[1]'),
        },
        
        '.space-simple-y > * + *': {
          marginTop: theme('spacing.4'),
        },
        '.gap-simple': {
          gap: theme('spacing.4'),
        },
      });
    }
  ],
}