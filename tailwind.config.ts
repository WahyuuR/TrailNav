import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0d0f',
        surface: '#111518',
        surface2: '#181d22',
        border: '#1f2a32',
        accent: '#00e5a0',
        accent2: '#00b8d4',
        accent3: '#ff6b35',
        warn: '#ffc857',
        muted: '#607d8b',
      },
      fontFamily: {
        mono: ['Space Mono', 'monospace'],
        condensed: ['Barlow Condensed', 'sans-serif'],
        sans: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
