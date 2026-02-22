/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'page-title': ['1.25rem', { lineHeight: '1.25' }],   /* 20px bold */
        'section': ['1rem', { lineHeight: '1.25' }],         /* 16px semibold */
        'body': ['0.9375rem', { lineHeight: '1.5' }],        /* 15px */
        'secondary': ['0.875rem', { lineHeight: '1.25' }],   /* 14px */
        'small': ['0.75rem', { lineHeight: '1.25' }],       /* 12px */
      },
      colors: {
        // Theme-aware background colors
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        tertiary: 'var(--color-bg-tertiary)',
        hover: 'var(--color-bg-hover)',
        
        // Theme-aware border color
        'border-default': 'var(--color-border)',
        
        // Accent colors
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        
        // Action colors
        like: 'var(--color-like)',
        repost: 'var(--color-repost)',
        reply: 'var(--color-reply)',
      },
      textColor: {
        // Theme-aware text colors
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
        accent: 'var(--color-accent)',
      },
      borderColor: {
        DEFAULT: 'var(--color-border)',
      },
      backgroundColor: {
        // Explicit mapping for bg utilities
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        tertiary: 'var(--color-bg-tertiary)',
        hover: 'var(--color-bg-hover)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        like: 'var(--color-like)',
        repost: 'var(--color-repost)',
        reply: 'var(--color-reply)',
      },
    },
  },
  plugins: [],
}
