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
        // Futuristic color palette
        primary: {
          DEFAULT: '#00D4FF',
          50: '#B3F0FF',
          100: '#99EBFF',
          200: '#66E0FF',
          300: '#33D6FF',
          400: '#00D4FF',
          500: '#00A8CC',
          600: '#007C99',
          700: '#005066',
          800: '#002433',
          900: '#001219',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          50: '#E4D4FB',
          100: '#D7C2F9',
          200: '#BC9EF5',
          300: '#A17AF1',
          400: '#8656ED',
          500: '#7C3AED',
          600: '#6425CB',
          700: '#4C1C99',
          800: '#341367',
          900: '#1C0A35',
        },
        success: {
          DEFAULT: '#10B981',
          glow: 'rgba(16, 185, 129, 0.4)',
        },
        danger: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.4)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.4)',
        },
        // Dark theme colors
        dark: {
          bg: '#000000',
          surface: '#0A0A0A',
          card: '#111111',
          border: '#1A1A1A',
          hover: '#1F1F1F',
        },
        // Glass morphism helpers
        glass: {
          white: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          dark: 'rgba(0, 0, 0, 0.5)',
        },
        // Text colors
        text: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          muted: '#6B7280',
          disabled: '#4B5563',
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
      backgroundImage: {
        // Gradient backgrounds
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        // Mesh gradient for backgrounds
        'mesh-gradient': `
          radial-gradient(at 0% 0%, hsla(189, 100%, 50%, 0.3) 0px, transparent 50%),
          radial-gradient(at 50% 0%, hsla(266, 78%, 60%, 0.2) 0px, transparent 50%),
          radial-gradient(at 100% 0%, hsla(189, 100%, 50%, 0.2) 0px, transparent 50%),
          radial-gradient(at 100% 100%, hsla(266, 78%, 60%, 0.3) 0px, transparent 50%),
          radial-gradient(at 0% 100%, hsla(189, 100%, 50%, 0.2) 0px, transparent 50%)
        `,
      },
      animation: {
        // Custom animations
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'gradient-shift': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        'glow': {
          '0%': {
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
          },
          '100%': {
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.6), 0 0 60px rgba(0, 212, 255, 0.4)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 212, 255, 0.3)',
        'glow-md': '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 212, 255, 0.5)',
        'glow-xl': '0 0 40px rgba(0, 212, 255, 0.6)',
        'inner-glow': 'inset 0 0 20px rgba(0, 212, 255, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}

export default config