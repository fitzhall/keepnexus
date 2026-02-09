'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const ACCESS_KEY = 'keep_access_token'

// Routes that don't require access
const PUBLIC_ROUTES = ['/', '/verify']

export function useAccessGate() {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
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
