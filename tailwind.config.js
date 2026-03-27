/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        sand: 'var(--sand)',
        foam: 'var(--foam)',
        sea: {
          DEFAULT: 'var(--sea)',
          dark: 'var(--sea-dark)',
        },
        sun: {
          DEFAULT: 'var(--sun)',
          soft: 'var(--sun-soft)',
          tint: 'var(--sun-tint)',
        },
      },
      fontFamily: {
        body: 'var(--font-body)',
        display: 'var(--font-display)',
      },
    },
  },
  plugins: [],
}

