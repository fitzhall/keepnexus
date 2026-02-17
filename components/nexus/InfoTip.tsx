'use client'

import { useState } from 'react'

interface InfoTipProps {
  text: string
}

export function InfoTip({ text }: InfoTipProps) {
  const [show, setShow] = useState(false)

  return (
    <span className="relative inline-block ml-1">
      <button
        onClick={() => setShow(prev => !prev)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-mono leading-none"
        aria-label="More info"
      >
        ?
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 text-xs font-mono leading-relaxed bg-zinc-800 dark:bg-zinc-800 text-zinc-300 border border-zinc-700 shadow-lg">
            {text}
          </div>
        </>
      )}
    </span>
  )
}
