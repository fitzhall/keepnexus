'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// ── Question Data ──────────────────────────────────────────────
const PILLARS = [
  { key: 'K', label: 'Key Governance' },
  { key: 'E', label: 'Estate Planning' },
  { key: 'E2', label: 'Continuity' },
  { key: 'P', label: 'Professional Support' },
] as const

type PillarKey = typeof PILLARS[number]['key']

interface Option {
  text: string
  points: number
}

interface Question {
  pillar: PillarKey
  question: string
  options: Option[]
}

const QUESTIONS: Question[] = [
  {
    pillar: 'K',
    question: 'How is your Bitcoin stored?',
    options: [
      { text: 'Exchange or custodian', points: 0 },
      { text: 'Single hardware wallet', points: 1 },
      { text: 'Multisig or distributed keys', points: 2 },
    ],
  },
  {
    pillar: 'K',
    question: 'Do you have a backup of your seed phrase?',
    options: [
      { text: 'No / not sure', points: 0 },
      { text: 'Yes, one copy in one location', points: 1 },
      { text: 'Multiple copies in separate secure locations', points: 2 },
    ],
  },
  {
    pillar: 'E',
    question: 'Do your heirs know you own Bitcoin?',
    options: [
      { text: 'No', points: 0 },
      { text: 'They know, but not how to access it', points: 1 },
      { text: 'Yes, with a documented access plan', points: 2 },
    ],
  },
  {
    pillar: 'E',
    question: 'Is your Bitcoin included in any legal estate document?',
    options: [
      { text: 'No', points: 0 },
      { text: 'Informally mentioned, not legally binding', points: 1 },
      { text: 'Yes, referenced in a will or trust', points: 2 },
    ],
  },
  {
    pillar: 'E2',
    question: 'If you were unreachable for 90 days, could someone access your Bitcoin?',
    options: [
      { text: 'No one could', points: 0 },
      { text: 'Someone might figure it out', points: 1 },
      { text: 'Yes, there\'s a clear recovery process', points: 2 },
    ],
  },
  {
    pillar: 'E2',
    question: 'Do you have a dead man\'s switch or check-in protocol?',
    options: [
      { text: 'No', points: 0 },
      { text: 'I\'ve thought about it but nothing set up', points: 1 },
      { text: 'Yes, an active protocol is in place', points: 2 },
    ],
  },
  {
    pillar: 'P',
    question: 'Has a tax or legal professional reviewed your Bitcoin holdings?',
    options: [
      { text: 'No', points: 0 },
      { text: 'Informally discussed', points: 1 },
      { text: 'Yes, formally reviewed and documented', points: 2 },
    ],
  },
  {
    pillar: 'P',
    question: 'Do you have a relationship with a Bitcoin-literate advisor?',
    options: [
      { text: 'No', points: 0 },
      { text: 'I\'ve looked into it', points: 1 },
      { text: 'Yes, actively working with one', points: 2 },
    ],
  },
]

// ── Scoring ────────────────────────────────────────────────────
interface Grade {
  letter: string
  label: string
  color: string
}

function getGrade(score: number): Grade {
  if (score >= 14) return { letter: 'A', label: 'Sovereign-ready', color: 'text-green-600' }
  if (score >= 10) return { letter: 'B', label: 'Strong foundation', color: 'text-emerald-600' }
  if (score >= 6) return { letter: 'C', label: 'Gaps to address', color: 'text-amber-600' }
  if (score >= 3) return { letter: 'D', label: 'At risk', color: 'text-orange-600' }
  return { letter: 'F', label: 'Critical exposure', color: 'text-red-600' }
}

type PillarVerdict = 'Strong' | 'Partial' | 'Exposed'

function getPillarVerdict(score: number): { verdict: PillarVerdict; color: string; bg: string } {
  if (score === 4) return { verdict: 'Strong', color: 'text-green-700', bg: 'bg-green-500' }
  if (score >= 2) return { verdict: 'Partial', color: 'text-amber-700', bg: 'bg-amber-400' }
  return { verdict: 'Exposed', color: 'text-red-700', bg: 'bg-red-500' }
}

function getPillarScore(answers: (number | null)[], pillarIndex: number): number {
  const start = pillarIndex * 2
  return (answers[start] ?? 0) + (answers[start + 1] ?? 0)
}

const PILLAR_INSIGHTS: Record<PillarKey, Record<PillarVerdict, string>> = {
  K: {
    Strong: 'Your key management is solid. Self-custody with proper backups.',
    Partial: 'Your keys need stronger backup or distribution strategy.',
    Exposed: 'Your Bitcoin is at serious risk without proper key management.',
  },
  E: {
    Strong: 'Your estate plan covers your Bitcoin. Your heirs are prepared.',
    Partial: 'Your heirs have some awareness, but gaps remain in legal coverage.',
    Exposed: 'Your Bitcoin could be lost to your family without estate planning.',
  },
  E2: {
    Strong: 'You have a continuity plan. Your Bitcoin survives disruption.',
    Partial: 'Some continuity measures exist, but they rely on improvisation.',
    Exposed: 'If something happens to you, your Bitcoin access dies with you.',
  },
  P: {
    Strong: 'You have professional support who understands Bitcoin.',
    Partial: 'Some professional guidance, but not Bitcoin-specific.',
    Exposed: 'No professional has reviewed your Bitcoin holdings or plan.',
  },
}

// ── Main Content Component ─────────────────────────────────────
function ScorecardContent() {
  const searchParams = useSearchParams()
  const sharedResult = searchParams.get('result')

  const [answers, setAnswers] = useState<(number | null)[]>(Array(8).fill(null))
  const [step, setStep] = useState(sharedResult ? 9 : 0)
  const [transitioning, setTransitioning] = useState(false)

  // Force light mode on this page
  useEffect(() => {
    const html = document.documentElement
    const wasDark = html.classList.contains('dark')
    html.classList.remove('dark')
    return () => {
      if (wasDark) html.classList.add('dark')
    }
  }, [])

  const handleAnswer = useCallback((questionIndex: number, points: number) => {
    if (transitioning) return
    setAnswers(prev => {
      const next = [...prev]
      next[questionIndex] = points
      return next
    })
    setTransitioning(true)
    setTimeout(() => {
      if (questionIndex === 7) {
        setStep(9)
      } else {
        setStep(questionIndex + 2)
      }
      setTransitioning(false)
    }, 400)
  }, [transitioning])

  const totalScore = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0)
  const grade = getGrade(totalScore)

  const handleShare = () => {
    const url = `${window.location.origin}/scorecard?result=${grade.letter}`
    navigator.clipboard.writeText(url)
  }

  // ── Landing ────────────────────────────────────────────────
  if (step === 0) {
    return (
      <main className="min-h-screen flex items-center bg-white">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <div className="text-zinc-400 text-xs font-mono tracking-widest mb-10">
            KEEP NEXUS
          </div>

          <div className="text-amber-500/70 text-4xl mb-6" aria-hidden="true">
            ₿
          </div>

          <h1 className="text-zinc-900 text-2xl font-light leading-relaxed mb-3">
            How secure is your Bitcoin legacy?
          </h1>

          <p className="text-zinc-500 text-sm font-mono leading-relaxed mb-10">
            8 questions. 90 seconds.<br />
            Find out where your custody plan has gaps.
          </p>

          <button
            onClick={() => setStep(1)}
            className="inline-block px-8 py-3 text-sm font-mono bg-amber-600 text-white hover:bg-amber-500 transition-colors"
          >
            [take the assessment]
          </button>

          <div className="mt-8">
            <Link
              href="/"
              className="text-zinc-400 text-xs font-mono hover:text-zinc-600 transition-colors"
            >
              &larr; back
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── Shared Result ──────────────────────────────────────────
  if (step === 9 && sharedResult) {
    const sharedGrade = getGrade(
      sharedResult === 'A' ? 16 : sharedResult === 'B' ? 12 : sharedResult === 'C' ? 8 : sharedResult === 'D' ? 4 : 0
    )
    return (
      <main className="min-h-screen flex items-center bg-white">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <div className="text-zinc-400 text-xs font-mono tracking-widest mb-10">
            KEEP NEXUS
          </div>

          <div className={`text-7xl font-light mb-2 ${sharedGrade.color}`}>
            {sharedGrade.letter}
          </div>
          <p className="text-zinc-500 text-sm font-mono mb-8">
            {sharedGrade.label}
          </p>

          <p className="text-zinc-600 text-sm leading-relaxed mb-8">
            Someone scored a {sharedGrade.letter} on the Bitcoin Custody Scorecard.<br />
            How do you compare?
          </p>

          <button
            onClick={() => {
              setStep(0)
              setAnswers(Array(8).fill(null))
              window.history.replaceState({}, '', '/scorecard')
            }}
            className="inline-block px-8 py-3 text-sm font-mono bg-amber-600 text-white hover:bg-amber-500 transition-colors"
          >
            [take the assessment]
          </button>
        </div>
      </main>
    )
  }

  // ── Questions ──────────────────────────────────────────────
  if (step >= 1 && step <= 8) {
    const qIndex = step - 1
    const q = QUESTIONS[qIndex]
    const pillar = PILLARS.find(p => p.key === q.pillar)!
    const selected = answers[qIndex]

    return (
      <main className="min-h-screen flex flex-col bg-white">
        {/* Progress bar */}
        <div className="flex gap-1 px-6 pt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < qIndex ? 'bg-amber-500' :
                i === qIndex ? 'bg-amber-400' :
                'bg-zinc-200'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 flex items-center">
          <div className="max-w-md mx-auto px-6 py-12 w-full">
            {/* Pillar label */}
            <div className="text-amber-600/70 text-xs font-mono tracking-widest mb-6">
              {pillar.key === 'E2' ? 'E' : pillar.key} — {pillar.label.toUpperCase()}
            </div>

            {/* Question */}
            <h2 className="text-zinc-900 text-xl font-light leading-relaxed mb-8">
              {q.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(qIndex, opt.points)}
                  disabled={transitioning}
                  className={`w-full text-left px-5 py-4 border font-mono text-sm transition-all ${
                    selected === opt.points
                      ? 'border-amber-500 bg-amber-50 text-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-400 text-zinc-700'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {/* Back button */}
            {qIndex > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-8 text-zinc-400 text-xs font-mono hover:text-zinc-600 transition-colors"
              >
                &larr; back
              </button>
            )}
          </div>
        </div>

        {/* Question counter */}
        <div className="text-center pb-6 text-zinc-400 text-xs font-mono">
          {step} of 8
        </div>
      </main>
    )
  }

  // ── Results ────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex items-center bg-white">
      <div className="max-w-md mx-auto px-6 py-12 w-full">
        <div className="text-zinc-400 text-xs font-mono tracking-widest mb-10 text-center">
          KEEP NEXUS — YOUR SCORE
        </div>

        {/* Overall grade */}
        <div className="text-center mb-10">
          <div className={`text-7xl font-light mb-2 ${grade.color}`}>
            {grade.letter}
          </div>
          <p className="text-zinc-500 text-sm font-mono">
            {grade.label}
          </p>
          <p className="text-zinc-400 text-xs font-mono mt-1">
            {totalScore} / 16
          </p>
        </div>

        {/* Pillar breakdown */}
        <div className="space-y-4 mb-10">
          {PILLARS.map((pillar, i) => {
            const score = getPillarScore(answers, i)
            const { verdict, color, bg } = getPillarVerdict(score)
            const insight = PILLAR_INSIGHTS[pillar.key][verdict]

            return (
              <div key={pillar.key} className="border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-500 tracking-wider">
                    {pillar.key === 'E2' ? 'E' : pillar.key} — {pillar.label}
                  </span>
                  <span className={`text-xs font-mono ${color}`}>
                    {verdict}
                  </span>
                </div>
                {/* Score bar */}
                <div className="h-1.5 bg-zinc-100 rounded-full mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${bg}`}
                    style={{ width: `${(score / 4) * 100}%` }}
                  />
                </div>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  {insight}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center border-t border-zinc-200 pt-8">
          <p className="text-zinc-600 text-sm mb-4">
            Fix the gaps. Build your Bitcoin legacy plan.
          </p>
          <Link
            href="/gate"
            className="inline-block px-8 py-3 text-sm font-mono bg-amber-600 text-white hover:bg-amber-500 transition-colors"
          >
            [build your shard]
          </Link>

          <div className="mt-6">
            <button
              onClick={handleShare}
              className="text-zinc-400 text-xs font-mono hover:text-zinc-600 transition-colors"
            >
              [copy share link]
            </button>
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                setStep(0)
                setAnswers(Array(8).fill(null))
              }}
              className="text-zinc-400 text-xs font-mono hover:text-zinc-600 transition-colors"
            >
              [retake]
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

// ── Page Export with Suspense ───────────────────────────────────
export default function ScorecardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center bg-white">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <div className="text-zinc-400 text-xs font-mono tracking-widest">
            KEEP NEXUS
          </div>
        </div>
      </main>
    }>
      <ScorecardContent />
    </Suspense>
  )
}
