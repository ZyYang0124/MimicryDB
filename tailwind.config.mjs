/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#ece7dd',      // "ink" is now light text on the dark theme
        teal: '#2dd4bf',     // brighter for dark backgrounds
        sand: '#0a0a0a',     // page background: near black
        coral: '#e08b6d',
        mist: '#141414',     // panel dark
        gold: '#d8c690',     // Hasselblad champagne accent
        slate: {
          100: '#1a1a1a',
          200: '#3a3d42',
          300: '#4a4e55',
          400: '#9aa3ad',
          500: '#b3bcc5',
          600: '#c3cbd3',
        },
      },
      fontFamily: {
        serif: ['Source Serif 4', 'Source Serif Pro', 'Georgia', 'Cambria', 'ui-serif', 'serif'],
        sans: ['Inter', 'SF Pro Text', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
