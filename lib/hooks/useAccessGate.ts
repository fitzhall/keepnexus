'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { IS_DESKTOP } from '@/lib/platform'

const ACCESS_KEY = 'keep_access_token'

// Routes that don't require access
const PUBLIC_ROUTES = ['/', '/verify']

export function hasValidAccess(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem(ACCESS_KEY)
  return token !== null && token.startsWith('KEEP-')
}

export function grantAccess(code: string) {
  localStorage.setItem(ACCESS_KEY, code)
}

export function revokeAccess() {
  localStorage.removeItem(ACCESS_KEY)
}

export function useAccessGate() {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(IS_DESKTOP)
  const [checking, setChecking] = useState(!IS_DESKTOP)

  useEffect(() => {
    // Desktop always has access
    if (IS_DESKTOP) return

    // Public routes skip the gate
    if (PUBLIC_ROUTES.includes(pathname)) {
      setAuthorized(true)
      setChecking(false)
      return
    }

    const token = localStorage.getItem(ACCESS_KEY)
    if (token && token.startsWith('KEEP-')) {
      setAuthorized(true)
    } else {
      router.replace('/verify')
    }
    setChecking(false)
  }, [pathname, router])

  return { authorized, checking }
}
