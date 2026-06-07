/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0056b3',
          50: '#e6f0fa',
          100: '#cce1f5',
          200: '#99c3eb',
          300: '#66a5e1',
          400: '#3387d7',
          500: '#0056b3',
          600: '#004590',
          700: '#00346c',
          800: '#002348',
          900: '#001224',
        },
        secondary: {
          DEFAULT: '#f59e0b',
          50: '#fef7ec',
          100: '#fdefd9',
          200: '#fbdfb3',
          300: '#f9cf8d',
          400: '#f7bf67',
          500: '#f59e0b',
          600: '#c47e09',
          700: '#935f07',
          800: '#623f04',
          900: '#312002',
        },
        'paper-bg': '#f3f4f6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        proxima: ['Proxima Nova', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
