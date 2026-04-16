/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#25D366',
          DEFAULT: '#128C7E',
          dark: '#075E54',
        },
        chat: {
          bg: '#EFEAE2',
          sent: '#D9FDD3',
          received: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}
