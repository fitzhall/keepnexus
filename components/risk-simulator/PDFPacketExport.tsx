/**
 * PDFPacketExport - Generate professional packet of stakeholder-specific PDFs
 * Phase 5: Attorney, CPA, and Technical Implementation Guide PDFs
 */

'use client'

import { useState } from 'react'
import { MultisigSetup, SimulationResult, Scenario } from '@/lib/risk-simulator/types'
import { PDFPlaybookGenerator } from '@/lib/risk-simulator/pdf-generator'
import { useFamilySetup } from '@/lib/context/FamilySetup'

interface PDFPacketExportProps {
  setup: MultisigSetup
  results: SimulationResult[]
  scenarios: Scenario[]
  resilienceScore: number
}

type PDFType = 'attorney' | 'cpa' | 'technical' | 'family'

interface PDFOption {
  type: PDFType
  label: string
  filename: (family: string) => string
}

export function PDFPacketExport({ setup, results, scenarios, resilienceScore }: PDFPacketExportProps) {
  // Get governance rules from context - THE VALUE PROPOSITION
  const { setup: contextSetup } = useFamilySetup()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPDFs, setSelectedPDFs] = useState<Set<PDFType>>(new Set(['attorney', 'cpa', 'technical']))
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingType, setGeneratingType] = useState<PDFType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const pdfOptions: PDFOption[] = [
    {
      type: 'attorney',
      label: 'Attorney Summary',
      filename: (family: string) => `${family.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_attorney_summary_${new Date().toISOString().split('T')[0]}.pdf`
    },
    {
      type: 'cpa',
      label: 'CPA Summary',
      filename: (family: string) => `${family.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_cpa_summary_${new Date().toISOString().split('T')[0]}.pdf`
    },
    {
      type: 'technical',
      label: 'Technical Guide',
      filename: (family: string) => `${family.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_technical_guide_${new Date().toISOString().split('T')[0]}.pdf`
    },
    {
      type: 'family',
      label: 'Family Playbook',
      filename: (family: string) => `${family.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_recovery_playbook_${new Date().toISOString().split('T')[0]}.pdf`
    }
  ]

  const togglePDF = (type: PDFType) => {
    const newSelected = new Set(selectedPDFs)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedPDFs(newSelected)
  }

  const generatePDF = async (type: PDFType): Promise<Blob> => {
    const generator = new PDFPlaybookGenerator()
    // Include governance rules - the complete family plan
    const options = {
      setup,
      results,
      scenarios,
      resilienceScore,
      governanceRules: contextSetup.governanceRules
    }

    switch (type) {
      case 'attorney':
        return await generator.generateAttorneySummary(options)
      case 'cpa':
        return await generator.generateCPASummary(options)
      case 'technical':
        return await generator.generateTechnicalGuide(options)
      case 'family':
        return await generator.generatePlaybook(options)
    }
  }

  const handleExportAll = async () => {
    if (selectedPDFs.size === 0) {
      setError('Please select at least one PDF to export')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      // Generate each selected PDF
      for (const type of Array.from(selectedPDFs)) {
        setGeneratingType(type)
        const option = pdfOptions.find(opt => opt.type === type)!

        const pdfBlob = await generatePDF(type)
        const filename = option.filename(setup.family)

        // Download PDF
        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setIsOpen(false)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDFs')
    } finally {
      setIsGenerating(false)
      setGeneratingType(null)
    }
  }

  const handleExportSingle = async (type: PDFType) => {
    setError(null)
    setIsGenerating(true)
    setGeneratingType(type)

    try {
      const option = pdfOptions.find(opt => opt.type === type)!
      const pdfBlob = await generatePDF(type)
      const filename = option.filename(setup.family)

      // Download PDF
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF')
    } finally {
      setIsGenerating(false)
      setGeneratingType(null)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors font-mono text-sm"
      >
        EXPORT
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 z-40"
            onClick={() => !isGenerating && setIsOpen(false)}
          />

          {/* Modal content */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-gray-900 z-50 w-full max-w-md">
            {/* Header */}
            <div className="p-4 border-b-2 border-gray-900">
              <h2 className="text-sm font-mono uppercase tracking-wider text-gray-900">
                Export Documents
              </h2>
            </div>

            {/* PDF Options - Simple table */}
            <div className="p-4">
              <table className="w-full">
                <tbody>
                  {pdfOptions.map((option, index) => (
                    <tr
                      key={option.type}
                      className={`${index !== pdfOptions.length - 1 ? 'border-b border-gray-300' : ''}`}
                    >
                      <td className="py-3 pr-3">
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedPDFs.has(option.type)}
                            onChange={() => !isGenerating && togglePDF(option.type)}
                            disabled={isGenerating}
                            className="w-4 h-4 border-2 border-gray-900 checked:bg-gray-900 focus:ring-0 focus:ring-offset-0 disabled:opacity-50"
                          />
                          <span className="ml-3 text-sm text-gray-900 group-hover:text-gray-600">
                            {option.label}
                          </span>
                        </label>
                      </td>
                      <td className="py-3 text-right">
                        {generatingType === option.type && (
                          <span className="text-xs font-mono text-gray-600">...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Error message */}
            {error && (
              <div className="mx-4 mb-4 p-2 border-l-4 border-gray-900 bg-white">
                <p className="text-xs font-mono text-gray-900">! {error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mx-4 mb-4 p-2 border-l-4 border-gray-900 bg-white">
                <p className="text-xs font-mono text-gray-600">
                  EXPORTED {new Date().toLocaleTimeString('en-US', { hour12: false })}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t-2 border-gray-900 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-600">
                {selectedPDFs.size} selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 text-xs font-mono text-gray-900 hover:bg-gray-100 disabled:opacity-50 border border-gray-300"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleExportAll}
                  disabled={isGenerating || selectedPDFs.size === 0}
                  className="px-3 py-1.5 text-xs font-mono bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {isGenerating ? 'EXPORTING...' : 'EXPORT'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
