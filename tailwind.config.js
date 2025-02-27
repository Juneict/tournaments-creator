/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'efootball-blue': '#1a365d',
        'efootball-orange': '#ed8936',
      },
      backgroundImage: {
        'hero-pattern': "url('/images/pattern.jpg')",
      },
    },
  },
  plugins: [],
}