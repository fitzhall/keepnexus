'use client'

interface PillarHeaderProps {
  letter: string
  label: string
  items: { label: string; done: boolean }[]
}

export function PillarHeader({ letter, label, items }: PillarHeaderProps) {
  const dots = items.map(i => (i.done ? '\u25CF' : '\u25CB')).join('')
  const doneCount = items.filter(i => i.done).length
  const pct = items.length > 0 ? doneCount / items.length : 0
  const letterColor = pct >= 0.75 ? 'text-green-500' : pct >= 0.4 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-zinc-500 pt-6 pb-1 font-mono tracking-wide min-w-0">
      <span className="text-zinc-600 hidden sm:inline">{'\u2500\u2500'}</span>
      <span className={`${letterColor} font-medium uppercase shrink-0`}>{letter}</span>
      <span className="text-zinc-600 shrink-0">{'\u00B7'}</span>
      <span className="text-zinc-500 truncate">{label}</span>
      <span className="flex-1 border-b border-zinc-800 hidden sm:block" />
      <span className="text-zinc-500 tracking-widest shrink-0 ml-auto">[{dots}]</span>
    </div>
  )
}
