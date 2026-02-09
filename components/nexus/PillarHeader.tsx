'use client'

interface PillarHeaderProps {
  letter: string
  label: string
  items: { label: string; done: boolean }[]
}

export function PillarHeader({ letter, label, items }: PillarHeaderProps) {
  const dots = items.map(i => (i.done ? '\u25CF' : '\u25CB')).join('')

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500 pt-6 pb-1 font-mono tracking-wide">
      <span className="text-zinc-600">{'\u2500\u2500'}</span>
      <span className="text-zinc-400 font-medium uppercase">{letter}</span>
      <span className="text-zinc-600">{'\u00B7'}</span>
      <span className="text-zinc-500">{label}</span>
      <span className="flex-1 border-b border-zinc-800" />
      <span className="text-zinc-500 tracking-widest">[{dots}]</span>
    </div>
  )
}
