/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fffaf0',
        coral: '#df6d5b',
        ink: '#243b36',
        sage: '#79a38d'
      }
    }
  },
  plugins: []
};
