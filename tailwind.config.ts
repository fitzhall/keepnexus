import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Vault color palette
        dark: {
          background: '#09090b',   // zinc-950 - near black, not pure black
          surface: '#18181b',      // zinc-900 - cards, elevated surfaces
          border: '#27272a',       // zinc-800 - subtle dividers
          muted: '#71717a',        // zinc-500 - labels, secondary text
          foreground: '#fafafa',   // zinc-50 - primary text
        },
        accent: {
          healthy: '#22c55e',      // green-500 - good status
          caution: '#eab308',      // yellow-500 - attention needed
          critical: '#ef4444',     // red-500 - action required
        },
        // Keep some utility colors for backwards compatibility
        success: {
          DEFAULT: '#22c55e',
        },
        danger: {
          DEFAULT: '#ef4444',
        },
        warning: {
          DEFAULT: '#eab308',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.5rem',
      },
      animation: {
        // Subtle, professional animations only
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
