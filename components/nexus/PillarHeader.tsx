'use client'

interface PillarHeaderProps {
  letter: string
  label: string
  items: { label: string; done: boolean }[]
  expanded?: boolean
  onToggle?: () => void
}

export function PillarHeader({ letter, label, items, expanded, onToggle }: PillarHeaderProps) {
  const dots = items.map(i => (i.done ? '\u25CF' : '\u25CB')).join('')
  const doneCount = items.filter(i => i.done).length
  const pct = items.length > 0 ? doneCount / items.length : 0
  const letterColor = pct >= 0.75 ? 'text-green-500' : pct >= 0.4 ? 'text-yellow-500' : 'text-red-500'

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-1.5 sm:gap-2 text-xs text-zinc-500 pt-5 pb-1 font-mono tracking-wide min-w-0 cursor-pointer hover:text-zinc-400 transition-colors"
    >
      <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">{'\u2500\u2500'}</span>
      <span className={`${letterColor} font-medium uppercase shrink-0`}>{letter}</span>
      <span className="text-zinc-400 dark:text-zinc-600 shrink-0">{'\u00B7'}</span>
      <span className="text-zinc-500 truncate">{label}</span>
      <span className="flex-1 border-b border-zinc-200 dark:border-zinc-800 hidden sm:block" />
      <span className="text-zinc-500 tracking-widest shrink-0 ml-auto">[{dots}]</span>
      <span className="text-zinc-600 shrink-0 text-xs ml-1">{expanded ? '\u25B4' : '\u25BE'}</span>
    </button>
  )
}
