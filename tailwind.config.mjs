/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#13293d',
        teal: '#0f766e',
        sand: '#faf8f2',
        coral: '#d97757',
        mist: '#eef2f5',
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
