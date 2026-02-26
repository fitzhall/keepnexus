'use client'

import dynamic from 'next/dynamic'
import { IS_DESKTOP } from '@/lib/platform'

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(mod => mod.Analytics),
  { ssr: false }
)

export function ConditionalAnalytics() {
  if (IS_DESKTOP) return null
  return <Analytics />
}
