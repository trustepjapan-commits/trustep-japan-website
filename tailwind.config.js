/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './blog/*.html'],
  theme: {
    extend: {
      colors: {
        'deep':  '#0c1a32',
        'mid':   '#0f2a53',
        'soft':  '#122e5c',
        'line':  '#1e3a66',
        'blue-a':'#4b9cfb',
        'cyan-a':'#007cff',
        'pink-a':'#f84f65',
        'gold-a':'#e8c76a',
        'muted': '#b8c5d8'
      },
      fontFamily: {
        serif: ['"Playfair Display"','"Noto Serif JP"','serif'],
        sans:  ['Inter','"Noto Sans JP"','system-ui','sans-serif']
      }
    }
  },
  plugins: []
}
