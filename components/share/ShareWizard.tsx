'use client'

/**
 * ShareWizard - Multi-step wizard for sharing shard with professionals
 *
 * Steps:
 * 1. Select professional type (attorney, CPA, advisor)
 * 2. Enter professional email
 * 3. Set expiration and access level
 * 4. Generate and display share link/bundle
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFamilySetup } from '@/lib/context/FamilySetup'
import { keepNexusFileService } from '@/lib/risk-simulator/file-export'
import { shareService, type ProfessionalType, type ShareBundle } from '@/lib/shard/share'
import { ShareTokenDisplay } from './ShareTokenDisplay'
import {
  Scale,
  Calculator,
  Briefcase,
  Mail,
  Clock,
  ChevronRight,
  ChevronLeft,
  Shield,
  Check,
} from 'lucide-react'

interface ShareWizardProps {
  onComplete?: () => void
  onCancel?: () => void
}

type WizardStep = 'type' | 'email' | 'settings' | 'result'

const PROFESSIONAL_TYPES = [
  {
    id: 'attorney' as ProfessionalType,
    label: 'Attorney',
    description: 'Estate planning attorney or legal counsel',
    Icon: Scale,
  },
  {
    id: 'cpa' as ProfessionalType,
    label: 'CPA',
    description: 'Certified Public Accountant for tax planning',
    Icon: Calculator,
  },
  {
    id: 'advisor' as ProfessionalType,
    label: 'Advisor',
    description: 'Financial advisor or Bitcoin specialist',
    Icon: Briefcase,
  },
]

const EXPIRATION_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days (Recommended)' },
  { value: 180, label: '180 days' },
]

export function ShareWizard({ onComplete, onCancel }: ShareWizardProps) {
  const { setup } = useFamilySetup()

  // Wizard state
  const [step, setStep] = useState<WizardStep>('type')
  const [professionalType, setProfessionalType] = useState<ProfessionalType>('attorney')
  const [email, setEmail] = useState('')
  const [expirationDays, setExpirationDays] = useState(90)
  const [accessLevel, setAccessLevel] = useState<'view' | 'propose_changes'>('propose_changes')

  // Result state
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareBundle, setShareBundle] = useState<ShareBundle | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleNext = () => {
    if (step === 'type') setStep('email')
    else if (step === 'email') setStep('settings')
    else if (step === 'settings') generateShare()
  }

  const handleBack = () => {
    if (step === 'email') setStep('type')
    else if (step === 'settings') setStep('email')
    else if (step === 'result') {
      setShareBundle(null)
      setStep('settings')
    }
  }

  const generateShare = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Create KeepNexusFile from current setup
      // Note: createFile expects MultisigSetup for first arg; we pass wallets[0] info
      // as the legacy MultisigSetup shape for backward compat with file-export
      const keepNexusFile = keepNexusFileService.createFile(
        setup.wallets?.[0] as any, // wallet as legacy MultisigSetup
        undefined, // analysis
        setup.governance_rules,
        setup.heirs,
        setup.legal as any,
        undefined, // scheduleEvents removed
        undefined, // drills data (legacy format)
        undefined, // vaultSettings removed
        undefined, // taxSettings — now professionals.cpa
        undefined, // captainSettings — now professionals
        undefined  // foreverSettings removed
      )

      // Generate share bundle
      await shareService.initialize()
      const bundle = await shareService.generateShareToken(keepNexusFile, {
        professional_type: professionalType,
        professional_email: email,
        access_level: accessLevel,
        expires_in_days: expirationDays,
      })

      setShareBundle(bundle)
      setStep('result')
    } catch (err) {
      console.error('Failed to generate share:', err)
      setError('Failed to generate share link. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const canProceed = () => {
    if (step === 'type') return true
    if (step === 'email') return isEmailValid
    if (step === 'settings') return true
    return false
  }

  const steps: WizardStep[] = ['type', 'email', 'settings', 'result']
  const currentStepIndex = steps.indexOf(step)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          Share with Professional
        </CardTitle>
        <CardDescription>
          Grant secure access to your inheritance plan for review and collaboration.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-orange-500 text-white'
                    : i < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div
                  className={`w-12 md:w-16 h-0.5 mx-1 md:mx-2 ${
                    i < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Professional Type */}
        {step === 'type' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Who are you sharing with?</h3>
            <div className="space-y-3">
              {PROFESSIONAL_TYPES.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    professionalType === type.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="professionalType"
                    value={type.id}
                    checked={professionalType === type.id}
                    onChange={() => setProfessionalType(type.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      professionalType === type.id
                        ? 'border-orange-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {professionalType === type.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <type.Icon className="h-6 w-6 text-gray-500" />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Email */}
        {step === 'email' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Professional&apos;s Email</h3>
            <p className="text-sm text-gray-500">
              Enter the email address of your {professionalType}. They&apos;ll use this to access your shard.
            </p>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="professional@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              {email && !isEmailValid && (
                <p className="text-sm text-red-500">Please enter a valid email address</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Share Settings</h3>

            {/* Expiration */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Access Duration
              </label>
              <select
                value={expirationDays}
                onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {EXPIRATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500">
                After this period, the share will expire and they&apos;ll need a new link.
              </p>
            </div>

            {/* Access Level */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Access Level</label>
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${
                    accessLevel === 'propose_changes'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="accessLevel"
                    value="propose_changes"
                    checked={accessLevel === 'propose_changes'}
                    onChange={() => setAccessLevel('propose_changes')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">View & Propose Changes</div>
                    <div className="text-sm text-gray-500">
                      They can review your setup and suggest modifications. You approve any changes.
                    </div>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${
                    accessLevel === 'view' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="accessLevel"
                    value="view"
                    checked={accessLevel === 'view'}
                    onChange={() => setAccessLevel('view')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">View Only</div>
                    <div className="text-sm text-gray-500">
                      Read-only access. They can see your setup but cannot propose changes.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>
                  <strong>Sharing with:</strong> {email} ({professionalType})
                </li>
                <li>
                  <strong>Expires:</strong> {expirationDays} days from now
                </li>
                <li>
                  <strong>Access:</strong>{' '}
                  {accessLevel === 'propose_changes' ? 'Can propose changes' : 'View only'}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && shareBundle && (
          <ShareTokenDisplay
            bundle={shareBundle}
            professionalEmail={email}
            professionalType={professionalType}
          />
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={step === 'type' ? onCancel : handleBack}
            disabled={isGenerating}
          >
            {step === 'type' ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </>
            )}
          </Button>

          {step !== 'result' ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isGenerating}
            >
              {isGenerating ? (
                'Generating...'
              ) : step === 'settings' ? (
                'Generate Share Link'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={onComplete}>
              Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
