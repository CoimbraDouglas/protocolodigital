export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta do logo Província Santa Cruz (vinho/marrom + mauve)
        vinho: {
          50: '#faf5f5',
          100: '#f2e6e6',
          200: '#e4cccc',
          300: '#cfa8a8',
          400: '#b58585',
          500: '#9a6363',
          600: '#7d4747',
          700: '#5c2e2e',
          800: '#4a2626',
          900: '#3a1e1e',
        },
        mauve: '#a98a8a',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
