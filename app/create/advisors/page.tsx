'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Advisor {
  role: string
  name: string
  firm: string
  email: string
}

export default function CreateAdvisorsPage() {
  const router = useRouter()
  const { setup, updateCaptainSettings, updateTaxSettings } = useFamilySetup()

  const [advisors, setAdvisors] = useState<Advisor[]>([
    { role: 'attorney', name: '', firm: '', email: '' },
    { role: 'cpa', name: '', firm: '', email: '' },
    { role: 'advisor', name: '', firm: '', email: '' },
  ])

  useEffect(() => {
    if (setup.captainSettings?.advisorName) {
      setAdvisors([
        {
          role: 'attorney',
          name: '',
          firm: setup.captainSettings.professionalNetwork?.attorney || '',
          email: '',
        },
        {
          role: 'cpa',
          name: setup.taxSettings?.cpaName || '',
          firm: '',
          email: setup.taxSettings?.cpaEmail || '',
        },
        {
          role: 'advisor',
          name: setup.captainSettings.advisorName || '',
          firm: setup.captainSettings.advisorFirm || '',
          email: setup.captainSettings.advisorEmail || '',
        },
      ])
    }
  }, [setup.captainSettings, setup.taxSettings])

  const updateAdvisor = (index: number, field: keyof Advisor, value: string) => {
    const updated = [...advisors]
    updated[index] = { ...updated[index], [field]: value }
    setAdvisors(updated)
  }

  const handleNext = () => {
    const attorney = advisors.find(a => a.role === 'attorney')
    const cpa = advisors.find(a => a.role === 'cpa')
    const advisor = advisors.find(a => a.role === 'advisor')

    updateCaptainSettings({
      ...setup.captainSettings,
      advisorName: advisor?.name || '',
      advisorEmail: advisor?.email || '',
      advisorFirm: advisor?.firm || '',
      professionalNetwork: {
        attorney: attorney?.firm || attorney?.name || '',
        cpa: cpa?.firm || cpa?.name || '',
        custodian: setup.captainSettings?.professionalNetwork?.custodian || '',
      },
    })

    if (cpa?.name || cpa?.email) {
      updateTaxSettings({
        ...setup.taxSettings,
        cpaName: cpa.name || cpa.firm || '',
        cpaEmail: cpa.email || '',
      })
    }

    router.push('/create/policies')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · create · 6/7</div>

        <div className="nexus-divider" />

        <p className="text-sm text-zinc-400 mb-6">
          Who are your key advisors? Leave blank if not applicable.
        </p>

        {/* Column Headers */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-4">
          <span className="w-20">role</span>
          <span className="flex-1">name</span>
          <span className="flex-1">firm</span>
          <span className="flex-1">email</span>
        </div>

        <div className="space-y-3">
          {advisors.map((advisor, idx) => (
            <div key={advisor.role} className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm w-20">{advisor.role}</span>
              <input
                type="text"
                className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono flex-1"
                value={advisor.name}
                onChange={(e) => updateAdvisor(idx, 'name', e.target.value)}
                placeholder="Name"
              />
              <input
                type="text"
                className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono flex-1"
                value={advisor.firm}
                onChange={(e) => updateAdvisor(idx, 'firm', e.target.value)}
                placeholder="Firm"
              />
              <input
                type="email"
                className="bg-transparent border-b border-zinc-700 text-zinc-200 focus:border-zinc-400 outline-none px-1 py-0.5 font-mono flex-1"
                value={advisor.email}
                onChange={(e) => updateAdvisor(idx, 'email', e.target.value)}
                placeholder="email"
              />
            </div>
          ))}
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <Link href="/create/legal" className="nexus-btn">[back]</Link>
          <button className="nexus-btn-primary" onClick={handleNext}>[next]</button>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
