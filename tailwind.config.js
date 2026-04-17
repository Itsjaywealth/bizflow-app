/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          from: '#22C55E',
          to: '#10B981',
          solid: '#16A34A',
          glow: '#34D399',
        },
        primary: {
          DEFAULT: '#16A34A',
          dark: '#15803D',
        },
        accent: '#34D399',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        darkbg: {
          DEFAULT: '#0B1120',
          card: '#111827',
          hover: '#1F2937',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
        'brand-dark': 'radial-gradient(circle at top left, rgba(52,211,153,0.16), transparent 26%), radial-gradient(circle at bottom right, rgba(34,197,94,0.12), transparent 24%), linear-gradient(180deg, #0B1120 0%, #111827 100%)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 18px 45px rgba(15, 23, 42, 0.08)',
        modal: '0 24px 64px rgba(15, 23, 42, 0.18)',
        button: '0 16px 34px rgba(34, 197, 94, 0.25)',
        glow: '0 0 0 1px rgba(52, 211, 153, 0.14), 0 18px 50px rgba(16, 185, 129, 0.22)',
      },
    },
  },
  plugins: [],
}
