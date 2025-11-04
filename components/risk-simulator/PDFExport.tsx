/**
 * PDFExport - Generate professional PDF recovery playbooks
 * Creates printable documents for advisors to give to families
 */

'use client'

import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { MultisigSetup, SimulationResult, Scenario } from '@/lib/risk-simulator/types'
import { PDFPlaybookGenerator } from '@/lib/risk-simulator/pdf-generator'

interface PDFExportProps {
  setup: MultisigSetup
  results: SimulationResult[]
  scenarios: Scenario[]
  resilienceScore: number
}

export function PDFExport({ setup, results, scenarios, resilienceScore }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleExport = async () => {
    setError(null)
    setIsGenerating(true)

    try {
      // Create PDF generator instance
      const generator = new PDFPlaybookGenerator()

      // Generate the PDF
      const pdfBlob = await generator.generatePlaybook({
        setup,
        results,
        scenarios,
        resilienceScore
      })

      // Generate filename
      const sanitized = setup.family.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${sanitized}_recovery_playbook_${timestamp}.pdf`

      // Download
      generator.downloadPDF(filename, pdfBlob)

      // Success!
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isGenerating || success}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
            Generating PDF...
          </>
        ) : success ? (
          <>
            <Download className="w-4 h-4" />
            Downloaded!
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Export PDF Report
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-10">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success tooltip */}
      {success && (
        <div className="absolute top-full mt-2 left-0 right-0 p-3 bg-green-50 border border-green-200 rounded-lg shadow-lg z-10">
          <p className="text-sm text-green-700">
            PDF downloaded successfully!
          </p>
        </div>
      )}
    </div>
  )
}
