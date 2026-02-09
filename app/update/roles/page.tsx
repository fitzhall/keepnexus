'use client'

import { useState, useEffect } from 'react'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Professional {
  role: string
  name: string
  firm: string
  email: string
}

export default function UpdateRolesPage() {
  const router = useRouter()
  const { setup, updateProfessionals } = useFamilySetup()

  const [professionals, setProfessionals] = useState<Professional[]>([
    { role: 'attorney', name: '', firm: '', email: '' },
    { role: 'cpa', name: '', firm: '', email: '' },
    { role: 'advisor', name: '', firm: '', email: '' }
  ])

  useEffect(() => {
    if (setup.professionals) {
      const network = setup.professionals
      setProfessionals([
        {
          role: 'attorney',
          name: network.attorney?.name || '',
          firm: network.attorney?.firm || '',
          email: network.attorney?.email || ''
        },
        {
          role: 'cpa',
          name: network.cpa?.name || '',
          firm: network.cpa?.firm || '',
          email: network.cpa?.email || ''
        },
        {
          role: 'advisor',
          name: network.advisor?.name || '',
          firm: network.advisor?.firm || '',
          email: network.advisor?.email || ''
        }
      ])
    }
  }, [setup.professionals])

  const updateProfessional = (index: number, field: keyof Professional, value: string) => {
    const newProfessionals = [...professionals]
    newProfessionals[index] = { ...newProfessionals[index], [field]: value }
    setProfessionals(newProfessionals)
  }

  const handleSave = () => {
    const attorney = professionals.find(p => p.role === 'attorney')
    const cpa = professionals.find(p => p.role === 'cpa')
    const advisor = professionals.find(p => p.role === 'advisor')

    updateProfessionals({
      attorney: attorney?.name ? { name: attorney.name, firm: attorney.firm, email: attorney.email } : undefined,
      cpa: cpa?.name ? { name: cpa.name, firm: cpa.firm, email: cpa.email } : undefined,
      advisor: advisor?.name ? { name: advisor.name, firm: advisor.firm, email: advisor.email } : undefined,
    })

    router.push('/dashboard')
  }

  return (
    <main className="nexus">
      <div className="nexus-container">
        <div className="nexus-title">KEEP NEXUS · update roles</div>

        <div className="nexus-divider" />

        <div className="text-sm text-zinc-500 mb-4">Professionals</div>

        {/* Column Headers */}
        <div className="nexus-row text-xs text-zinc-500 uppercase tracking-wider mb-4">
          <span className="w-20">role</span>
          <span className="flex-1">name</span>
          <span className="flex-1">firm</span>
          <span className="flex-1">email</span>
        </div>

        <div className="space-y-3">
          {professionals.map((professional, idx) => (
            <div key={professional.role} className="flex items-center gap-2">
              <span className="w-20 text-zinc-400">{professional.role}</span>
              <input
                type="text"
                className="nexus-input flex-1"
                value={professional.name}
                onChange={(e) => updateProfessional(idx, 'name', e.target.value)}
                placeholder="Name"
              />
              <input
                type="text"
                className="nexus-input flex-1"
                value={professional.firm}
                onChange={(e) => updateProfessional(idx, 'firm', e.target.value)}
                placeholder="Firm"
              />
              <input
                type="email"
                className="nexus-input flex-1"
                value={professional.email}
                onChange={(e) => updateProfessional(idx, 'email', e.target.value)}
                placeholder="email@firm.com"
              />
            </div>
          ))}
        </div>

        <div className="nexus-divider" />

        <div className="nexus-actions">
          <button className="nexus-btn-primary" onClick={handleSave}>[save]</button>
          <Link href="/dashboard" className="nexus-btn">[cancel]</Link>
        </div>
      </div>
    </main>
  )
}
