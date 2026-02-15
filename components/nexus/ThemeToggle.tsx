'use client'

import { useTheme } from '@/lib/context/Theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="nexus-btn text-xs font-mono"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '[light]' : '[dark]'}
    </button>
  )
}
