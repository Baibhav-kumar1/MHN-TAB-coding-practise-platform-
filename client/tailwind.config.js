/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0d1117',
          surface: '#161b22',
          panel: '#1f242c',
          border: '#30363d',
          active: '#21262d',
          text: '#e6edf3',
          muted: '#8b949e',
          accent: '#58a6ff'
        },
        light: {
          bg: '#f6f8fa',
          surface: '#ffffff',
          panel: '#f0f3f6',
          border: '#d0d7de',
          active: '#eaeef2',
          text: '#1f2328',
          muted: '#656d76',
          accent: '#0969da'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
