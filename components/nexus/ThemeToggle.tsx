'use client'

import { useTheme } from '@/lib/context/Theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="text-zinc-400 dark:text-zinc-600 text-xs font-mono hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '○' : '●'}
    </button>
  )
}
