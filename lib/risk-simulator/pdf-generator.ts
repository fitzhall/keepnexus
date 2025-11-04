/**
 * PDF Recovery Playbook Generator
 * Creates professional printable documents for Bitcoin estate recovery
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MultisigSetup, SimulationResult, Scenario } from './types'
import { GovernanceRule } from '../context/FamilySetup'

interface PDFGenerationOptions {
  setup: MultisigSetup
  results: SimulationResult[]
  scenarios: Scenario[]
  resilienceScore: number
  governanceRules?: GovernanceRule[]  // CRITICAL: The value proposition
}

export class PDFPlaybookGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private currentY: number

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
  }

  /**
   * Generate complete recovery playbook PDF
   */
  async generatePlaybook(options: PDFGenerationOptions): Promise<Blob> {
    const { setup, results, scenarios, resilienceScore } = options

    // Page 1: Cover page
    this.addCoverPage(setup, resilienceScore)

    // Page 2: Executive Summary
    this.addNewPage()
    this.addExecutiveSummary(setup, results, resilienceScore)

    // Page 3: Risk Matrix
    this.addNewPage()
    this.addRiskMatrix(setup, scenarios, results)

    // Pages 4+: Recovery Scenarios
    results.forEach((result, index) => {
      if (index > 0 || this.currentY > this.pageHeight - 80) {
        this.addNewPage()
      }
      this.addRecoveryScenario(result, setup)
    })

    // Final Page: Key Holder Directory
    this.addNewPage()
    this.addKeyHolderDirectory(setup)

    // Generate blob
    const pdfBlob = this.doc.output('blob')
    return pdfBlob
  }

  /**
   * Cover Page
   */
  private addCoverPage(setup: MultisigSetup, resilienceScore: number) {
    // Logo/Branding area
    this.doc.setFillColor(17, 24, 39) // gray-900
    this.doc.rect(0, 0, this.pageWidth, 80, 'F')

    // Title
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(32)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Bitcoin Recovery Playbook', this.pageWidth / 2, 35, { align: 'center' })

    // Subtitle
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Multisig Estate Planning Guide', this.pageWidth / 2, 50, { align: 'center' })

    // KeepNexus branding
    this.doc.setFontSize(10)
    this.doc.text('Powered by KeepNexus', this.pageWidth / 2, 65, { align: 'center' })

    // Family info box
    this.doc.setTextColor(0, 0, 0)
    this.currentY = 100

    this.doc.setFillColor(249, 250, 251) // gray-50
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 60, 3, 3, 'F')

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Family:', this.margin + 10, this.currentY + 15)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(setup.family, this.margin + 40, this.currentY + 15)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Configuration:', this.margin + 10, this.currentY + 30)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`${setup.threshold}-of-${setup.totalKeys} Multisig`, this.margin + 40, this.currentY + 30)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Total Keys:', this.margin + 10, this.currentY + 45)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`${setup.keys.length}`, this.margin + 40, this.currentY + 45)

    // Resilience score badge
    this.currentY += 80
    const scoreColor = resilienceScore >= 80 ? [34, 197, 94] : resilienceScore >= 60 ? [234, 179, 8] : [239, 68, 68]
    this.doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2])
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 3, 3, 'F')

    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(`Resilience Score: ${resilienceScore}%`, this.pageWidth / 2, this.currentY + 20, { align: 'center' })

    // Important notice
    this.doc.setTextColor(0, 0, 0)
    this.currentY = this.pageHeight - 80
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('IMPORTANT INFORMATION', this.pageWidth / 2, this.currentY, { align: 'center' })

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    const notice = [
      'This document contains NO private keys or seed phrases.',
      'It is a recovery guide showing WHO holds keys and WHERE they are stored.',
      'Store this document securely and share only with trusted parties.',
    ]
    notice.forEach((line, i) => {
      this.doc.text(line, this.pageWidth / 2, this.currentY + 10 + i * 6, { align: 'center' })
    })

    // Footer
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128) // gray-500
    this.doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, this.pageWidth / 2, this.pageHeight - 15, { align: 'center' })
  }

  /**
   * Executive Summary
   */
  private addExecutiveSummary(setup: MultisigSetup, results: SimulationResult[], resilienceScore: number) {
    this.addSectionHeader('Executive Summary')

    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')

    const summary = [
      `This recovery playbook provides detailed instructions for accessing the ${setup.family}'s`,
      `Bitcoin holdings in the event of an emergency. The multisig wallet requires ${setup.threshold} out of`,
      `${setup.totalKeys} keys to authorize transactions.`,
      '',
      `RESILIENCE ANALYSIS:`,
      `• Tested against ${results.length} disaster scenarios`,
      `• ${results.filter(r => r.outcome === 'recoverable').length} scenarios: Funds RECOVERABLE`,
      `• ${results.filter(r => r.outcome === 'locked').length} scenarios: Funds LOCKED (critical risk)`,
      `• Overall resilience score: ${resilienceScore}%`,
    ]

    summary.forEach(line => {
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += 6
    })

    this.currentY += 10

    // Configuration overview
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Configuration Overview:', this.margin, this.currentY)
    this.currentY += 8
    this.doc.setFont('helvetica', 'normal')

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Key #', 'Holder', 'Storage Type', 'Location']],
      body: setup.keys.map((key, i) => [
        `${i + 1}`,
        key.holder,
        key.type === 'sharded' && key.shardConfig
          ? `Sharded (${key.shardConfig.k}-of-${key.shardConfig.m})`
          : key.storage.replace('-', ' '),
        key.location
      ]),
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10
  }

  /**
   * Risk Matrix
   */
  private addRiskMatrix(setup: MultisigSetup, scenarios: Scenario[], results: SimulationResult[]) {
    this.addSectionHeader('Risk Matrix')

    this.doc.setFontSize(10)
    this.doc.text('Key availability across disaster scenarios:', this.margin, this.currentY)
    this.currentY += 10

    // Build matrix data
    const headers = ['Key Holder', ...scenarios.map(s => s.name)]
    const rows = setup.keys.map(key => {
      const row = [key.holder]
      scenarios.forEach(scenario => {
        const isAvailable = !scenario.unavailableHolders.includes(key.holder) ||
          (key.type === 'sharded' && key.shardConfig &&
            key.shardConfig.holders.filter(h => !scenario.unavailableHolders.includes(h)).length >= key.shardConfig.k)
        row.push(isAvailable ? '✓' : '✗')
      })
      return row
    })

    // Add outcome row
    const outcomeRow = ['OUTCOME']
    results.forEach(result => {
      outcomeRow.push(result.outcome === 'recoverable' ? 'RECOVERABLE' : 'LOCKED')
    })
    rows.push(outcomeRow)

    autoTable(this.doc, {
      startY: this.currentY,
      head: [headers],
      body: rows,
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left' }
      },
      didParseCell: (data) => {
        // Color code the cells
        if (data.row.index === rows.length - 1) {
          // Outcome row
          data.cell.styles.fontStyle = 'bold'
          if (data.cell.text[0] === 'RECOVERABLE') {
            data.cell.styles.fillColor = [220, 252, 231] // green-100
            data.cell.styles.textColor = [21, 128, 61] // green-700
          } else if (data.cell.text[0] === 'LOCKED') {
            data.cell.styles.fillColor = [254, 226, 226] // red-100
            data.cell.styles.textColor = [185, 28, 28] // red-700
          }
        } else if (data.column.index > 0) {
          if (data.cell.text[0] === '✓') {
            data.cell.styles.textColor = [21, 128, 61] // green-700
          } else if (data.cell.text[0] === '✗') {
            data.cell.styles.textColor = [185, 28, 28] // red-700
          }
        }
      }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10
  }

  /**
   * Individual Recovery Scenario
   */
  private addRecoveryScenario(result: SimulationResult, setup: MultisigSetup) {
    if (this.currentY > this.pageHeight - 100) {
      this.addNewPage()
    }

    // Scenario header
    this.doc.setFillColor(249, 250, 251) // gray-50
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 2, 2, 'F')

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(result.scenario.name, this.margin + 5, this.currentY + 8)

    // Outcome badge
    const outcomeText = result.outcome === 'recoverable' ? 'RECOVERABLE' : 'LOCKED'
    const outcomeColor = result.outcome === 'recoverable' ? [34, 197, 94] : [239, 68, 68]
    this.doc.setFillColor(outcomeColor[0], outcomeColor[1], outcomeColor[2])
    this.doc.roundedRect(this.pageWidth - this.margin - 40, this.currentY + 2, 35, 8, 2, 2, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(8)
    this.doc.text(outcomeText, this.pageWidth - this.margin - 22, this.currentY + 7, { align: 'center' })

    this.doc.setTextColor(0, 0, 0)
    this.currentY += 18

    // Scenario description
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(result.scenario.description, this.margin, this.currentY)
    this.currentY += 8

    if (result.outcome === 'recoverable' && result.recoveryPath) {
      // Recovery instructions
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Recovery Steps:', this.margin, this.currentY)
      this.currentY += 6
      this.doc.setFont('helvetica', 'normal')

      const steps = [
        `1. Locate and retrieve the following ${result.recoveryPath.length} keys:`,
        ...result.recoveryPath.map(holderName => {
          const key = setup.keys.find(k => k.holder === holderName)
          return `   • ${holderName}: ${key?.storage.replace('-', ' ')} at ${key?.location}`
        }),
        '',
        `2. Use your Bitcoin wallet software to import these ${result.recoveryPath.length} keys`,
        `3. Sign the transaction with ${setup.threshold} of these keys`,
        `4. Broadcast the transaction to the Bitcoin network`,
      ]

      steps.forEach(step => {
        this.doc.text(step, this.margin + 5, this.currentY)
        this.currentY += 5
      })
    } else {
      // Locked scenario - show recommendations
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(185, 28, 28) // red-700
      this.doc.text('⚠ CRITICAL RISK - Funds Cannot Be Recovered', this.margin, this.currentY)
      this.currentY += 8

      this.doc.setTextColor(0, 0, 0)
      this.doc.setFont('helvetica', 'normal')

      if (result.recommendation) {
        this.doc.text('Recommendation:', this.margin, this.currentY)
        this.currentY += 6
        this.doc.text(`• ${result.recommendation}`, this.margin + 5, this.currentY)
        this.currentY += 5
      }

      if (result.details) {
        this.currentY += 3
        this.doc.setFontSize(9)
        this.doc.text(result.details, this.margin + 5, this.currentY, {
          maxWidth: this.pageWidth - 2 * this.margin - 10
        })
        this.currentY += 10
      }
    }

    this.currentY += 10
  }

  /**
   * Key Holder Directory
   */
  private addKeyHolderDirectory(setup: MultisigSetup) {
    this.addSectionHeader('Key Holder Directory')

    this.doc.setFontSize(10)
    this.doc.text('Complete list of key holders and locations:', this.margin, this.currentY)
    this.currentY += 10

    setup.keys.forEach((key, index) => {
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage()
      }

      // Key holder card
      this.doc.setFillColor(249, 250, 251) // gray-50
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 2, 2, 'F')

      this.doc.setFontSize(11)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`Key ${index + 1}: ${key.holder}`, this.margin + 5, this.currentY + 8)

      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Storage: ${key.storage.replace('-', ' ')}`, this.margin + 5, this.currentY + 16)
      this.doc.text(`Location: ${key.location}`, this.margin + 5, this.currentY + 23)

      if (key.type === 'sharded' && key.shardConfig) {
        this.doc.text(`Sharding: ${key.shardConfig.k}-of-${key.shardConfig.m} reconstruction required`, this.margin + 5, this.currentY + 30)
      }

      this.currentY += 40
    })
  }

  /**
   * Helper: Add section header
   */
  private addSectionHeader(title: string) {
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)

    this.doc.setDrawColor(17, 24, 39) // gray-900
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2)

    this.currentY += 12
  }

  /**
   * Helper: Add new page
   */
  private addNewPage() {
    this.doc.addPage()
    this.currentY = this.margin

    // Page footer
    const pageNum = (this.doc as any).internal.getNumberOfPages()
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128) // gray-500
    this.doc.text(`Page ${pageNum}`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' })
    this.doc.text('KeepNexus Recovery Playbook', this.pageWidth / 2, this.pageHeight - 5, { align: 'center' })
    this.doc.setTextColor(0, 0, 0)
  }

  /**
   * Helper: Download PDF
   */
  downloadPDF(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ============================================================================
  // PHASE 5: PROFESSIONAL PACKET GENERATOR
  // Three additional PDF types for stakeholder coordination
  // ============================================================================

  /**
   * Generate Attorney Summary PDF
   * Legal-focused document for trust/will integration
   */
  async generateAttorneySummary(options: PDFGenerationOptions): Promise<Blob> {
    const { setup, results, scenarios, resilienceScore } = options

    // Reset document for new PDF
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.currentY = this.margin

    // Page 1: Cover page
    this.addAttorneyCoverPage(setup, resilienceScore)

    // Page 2: Executive Summary for Attorney
    this.addNewPage()
    this.addAttorneyExecutiveSummary(setup, results, resilienceScore)

    // Page 3: Inheritance Flow
    this.addNewPage()
    this.addInheritanceFlow(setup)

    // Page 4: Key Holder Succession Plan
    this.addNewPage()
    this.addSuccessionPlan(setup)

    // Page 5: Trust Integration Points
    this.addNewPage()
    this.addTrustIntegration(setup)

    // Page 6: Legal Review Checklist
    this.addNewPage()
    this.addLegalChecklist(setup)

    // Final Page: Signature Pages
    this.addNewPage()
    this.addSignaturePages(setup)

    return this.doc.output('blob')
  }

  /**
   * Attorney Cover Page
   */
  private addAttorneyCoverPage(setup: MultisigSetup, resilienceScore: number) {
    // Header bar
    this.doc.setFillColor(17, 24, 39) // gray-900
    this.doc.rect(0, 0, this.pageWidth, 80, 'F')

    // Title
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(32)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Attorney Summary', this.pageWidth / 2, 35, { align: 'center' })

    // Subtitle
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Bitcoin Estate Planning Integration Guide', this.pageWidth / 2, 50, { align: 'center' })

    // KeepNexus branding
    this.doc.setFontSize(10)
    this.doc.text('Powered by KeepNexus', this.pageWidth / 2, 65, { align: 'center' })

    // Client info box
    this.doc.setTextColor(0, 0, 0)
    this.currentY = 100

    this.doc.setFillColor(249, 250, 251) // gray-50
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 70, 3, 3, 'F')

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Client:', this.margin + 10, this.currentY + 15)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(setup.family, this.margin + 40, this.currentY + 15)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Wallet Type:', this.margin + 10, this.currentY + 30)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`${setup.threshold}-of-${setup.totalKeys} Multisignature Bitcoin Wallet`, this.margin + 40, this.currentY + 30)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Key Holders:', this.margin + 10, this.currentY + 45)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`${setup.keys.length} independent holders`, this.margin + 40, this.currentY + 45)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Resilience:', this.margin + 10, this.currentY + 60)
    this.doc.setFont('helvetica', 'normal')
    const scoreColor = resilienceScore >= 80 ? [34, 197, 94] : resilienceScore >= 60 ? [234, 179, 8] : [239, 68, 68]
    this.doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    this.doc.text(`${resilienceScore}% (${resilienceScore >= 80 ? 'Strong' : resilienceScore >= 60 ? 'Moderate' : 'Weak'})`, this.margin + 40, this.currentY + 60)
    this.doc.setTextColor(0, 0, 0)

    // Important notice
    this.currentY = this.pageHeight - 90
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('ATTORNEY USE ONLY', this.pageWidth / 2, this.currentY, { align: 'center' })

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    const notice = [
      'This document contains NO private keys, seed phrases, or Bitcoin wallet credentials.',
      'It provides legal context for trust/will integration and succession planning.',
      'Review with client before incorporating into estate documents.',
      'Store securely with client\'s estate planning files.',
    ]
    notice.forEach((line, i) => {
      this.doc.text(line, this.pageWidth / 2, this.currentY + 10 + i * 6, { align: 'center' })
    })

    // Footer
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, this.pageWidth / 2, this.pageHeight - 15, { align: 'center' })
    this.doc.setTextColor(0, 0, 0)
  }

  /**
   * Attorney Executive Summary
   */
  private addAttorneyExecutiveSummary(setup: MultisigSetup, results: SimulationResult[], resilienceScore: number) {
    this.addSectionHeader('Executive Summary')

    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')

    const summary = [
      `This document provides legal context for integrating ${setup.family}'s Bitcoin holdings`,
      `into their estate plan. The Bitcoin is secured using a ${setup.threshold}-of-${setup.totalKeys} multisignature wallet,`,
      `which requires ${setup.threshold} independent signatures to authorize any transaction.`,
      '',
      'KEY LEGAL CONSIDERATIONS:',
      '',
      '1. ASSET CLASSIFICATION',
      '   • Bitcoin is intangible personal property (similar to securities)',
      '   • Subject to estate tax and probate unless properly planned',
      '   • Transfer on death provisions may apply depending on jurisdiction',
      '',
      '2. KEY HOLDER STRUCTURE',
      `   • ${setup.keys.length} independent key holders identified`,
      `   • Minimum ${setup.threshold} signatures required for access`,
      '   • Key holders are NOT custodians of the Bitcoin itself',
      '   • Keys represent authorization ability, not ownership',
      '',
      '3. SUCCESSION PLANNING PRIORITY',
      `   • Resilience score: ${resilienceScore}% (${results.filter(r => r.outcome === 'recoverable').length}/${results.length} scenarios recoverable)`,
      results.filter(r => r.outcome === 'locked').length > 0
        ? `   • ⚠ WARNING: ${results.filter(r => r.outcome === 'locked').length} scenario(s) would result in permanent loss`
        : '   • ✓ All disaster scenarios are recoverable',
    ]

    summary.forEach(line => {
      if (this.currentY > this.pageHeight - 40) {
        this.addNewPage()
      }
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += line === '' ? 3 : 6
    })
  }

  /**
   * Inheritance Flow
   */
  private addInheritanceFlow(setup: MultisigSetup) {
    this.addSectionHeader('Inheritance Flow Chart')

    this.doc.setFontSize(10)
    this.doc.text('Plain English explanation of who gets what, when:', this.margin, this.currentY)
    this.currentY += 10

    // Scenario-based inheritance flow
    const flowSteps = [
      {
        title: 'STEP 1: Death or Incapacity Event',
        items: [
          'Executor or appointed representative is notified',
          'Recovery process begins according to estate plan',
          'Key holders are contacted for signature authorization',
        ]
      },
      {
        title: 'STEP 2: Key Assembly',
        items: [
          `Locate and retrieve ${setup.threshold} of ${setup.keys.length} keys from holders:`,
          ...setup.keys.slice(0, setup.threshold).map(key => `  • ${key.holder}: ${key.storage} (${key.location})`),
          'Executor coordinates with key holders to obtain signatures',
        ]
      },
      {
        title: 'STEP 3: Bitcoin Transfer',
        items: [
          'Bitcoin wallet software imports the keys',
          `${setup.threshold} key holders sign the transaction`,
          'Funds transferred to beneficiary wallet(s) per estate plan',
          'Transaction recorded on Bitcoin blockchain (permanent)',
        ]
      },
      {
        title: 'STEP 4: Estate Distribution',
        items: [
          'Bitcoin received by beneficiaries as specified in will/trust',
          'Fair market value at date of death used for tax basis',
          'Distribution documented in estate accounting',
          'Probate (if applicable) concludes with Bitcoin transfer complete',
        ]
      }
    ]

    flowSteps.forEach(step => {
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage()
      }

      // Step header
      this.doc.setFillColor(17, 24, 39)
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
      this.doc.setTextColor(255, 255, 255)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(step.title, this.margin + 5, this.currentY + 7)
      this.doc.setTextColor(0, 0, 0)
      this.currentY += 15

      // Step items
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      step.items.forEach(item => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(`• ${item}`, this.margin + 5, this.currentY)
        this.currentY += 5
      })
      this.currentY += 5
    })
  }

  /**
   * Key Holder Succession Plan
   */
  private addSuccessionPlan(setup: MultisigSetup) {
    this.addSectionHeader('Key Holder Succession Plan')

    this.doc.setFontSize(10)
    this.doc.text('Recommended succession planning for each key holder:', this.margin, this.currentY)
    this.currentY += 10

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Key Holder', 'Storage Location', 'Succession Recommendation']],
      body: setup.keys.map((key) => [
        key.holder,
        `${key.storage}\n${key.location}`,
        key.holder.toLowerCase().includes('dad') || key.holder.toLowerCase().includes('mom')
          ? 'Name alternate key holder in event of incapacity. Consider adult child or trusted advisor.'
          : key.holder.toLowerCase().includes('attorney') || key.holder.toLowerCase().includes('lawyer')
            ? 'Ensure law firm has succession plan. Identify backup attorney with access to client files.'
            : key.holder.toLowerCase().includes('custodian')
              ? 'Verify custodian\'s business continuity plan. Ensure heirs have account access credentials.'
              : 'Document how successor gains access. Update estate plan if holder changes.'
      ]),
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 45 },
        2: { cellWidth: 80 }
      }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15

    // Important notice
    this.doc.setFillColor(254, 243, 199) // yellow-100
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 3, 3, 'F')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('⚠ ATTORNEY RECOMMENDATION:', this.margin + 5, this.currentY + 8)
    this.doc.setFont('helvetica', 'normal')
    const notice = [
      'Review key holder succession annually. Update estate documents if holders change.',
      'Consider adding provisions for replacement key holders in the event of death or incapacity.',
      'Ensure executor has contact information for all key holders.',
    ]
    notice.forEach((line, i) => {
      this.doc.text(line, this.margin + 5, this.currentY + 14 + i * 5, {
        maxWidth: this.pageWidth - 2 * this.margin - 10
      })
    })
  }

  /**
   * Trust Document Integration Points
   */
  private addTrustIntegration(setup: MultisigSetup) {
    this.addSectionHeader('Trust Document Integration')

    this.doc.setFontSize(10)
    this.doc.text('Recommended language for trust documents:', this.margin, this.currentY)
    this.currentY += 10

    const sections = [
      {
        title: 'ARTICLE: Digital Assets',
        content: [
          'Sample trust language for Bitcoin holdings:',
          '',
          '"The Trustee shall have the authority to manage, invest, and distribute all digital assets',
          'of the Trust, including but not limited to Bitcoin and other cryptocurrency holdings.',
          `The Trustee may coordinate with ${setup.threshold} of ${setup.keys.length} designated key holders to authorize`,
          'transactions involving multisignature Bitcoin wallets held by the Trust."',
        ]
      },
      {
        title: 'SCHEDULE A: Bitcoin Holdings',
        content: [
          'Attach as Schedule A to trust document:',
          '',
          `• Wallet Type: ${setup.threshold}-of-${setup.totalKeys} Multisignature Bitcoin Wallet`,
          `• Key Holders: ${setup.keys.length} independent parties (see attached Key Holder Directory)`,
          '• Estimated Value: [To be updated annually or as needed]',
          '• Location of Recovery Instructions: [Safe deposit box / with attorney / etc.]',
        ]
      },
      {
        title: 'TRUSTEE POWERS',
        content: [
          'Ensure trustee has explicit authority to:',
          '',
          '• Access and manage cryptocurrency wallets',
          '• Coordinate with key holders for transaction signatures',
          '• Engage technical assistance for wallet recovery',
          '• Convert Bitcoin to fiat currency if necessary for distribution',
          '• Make decisions regarding timing of liquidation (tax considerations)',
        ]
      }
    ]

    sections.forEach(section => {
      if (this.currentY > this.pageHeight - 80) {
        this.addNewPage()
      }

      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(11)
      this.doc.text(section.title, this.margin, this.currentY)
      this.currentY += 8

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      section.content.forEach(line => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(line, this.margin + 5, this.currentY, {
          maxWidth: this.pageWidth - 2 * this.margin - 10
        })
        this.currentY += line === '' ? 3 : 5
      })
      this.currentY += 8
    })
  }

  /**
   * Legal Review Checklist
   */
  private addLegalChecklist(setup: MultisigSetup) {
    this.addSectionHeader('Legal Review Checklist')

    this.doc.setFontSize(10)
    this.doc.text('Attorney checklist for Bitcoin estate planning integration:', this.margin, this.currentY)
    this.currentY += 10

    const checklist = [
      { category: 'Trust/Will Review', items: [
        '☐ Trust/will explicitly mentions digital assets or Bitcoin',
        '☐ Trustee/executor has authority to manage cryptocurrency',
        '☐ Multisignature structure is documented in estate plan',
        '☐ Key holder contact information is current and accessible',
        '☐ Successor key holders identified (if applicable)',
      ]},
      { category: 'Tax Planning', items: [
        '☐ Cost basis documentation is available',
        '☐ Date-of-death valuation method determined',
        '☐ State-specific cryptocurrency tax rules reviewed',
        '☐ Gift tax implications considered (if lifetime transfers)',
        '☐ Estate tax planning incorporates Bitcoin value',
      ]},
      { category: 'Access & Security', items: [
        '☐ Recovery playbook is stored securely',
        '☐ Executor knows location of recovery instructions',
        '☐ Key holders are identified in estate documents',
        `☐ Minimum ${setup.threshold} key holders are accessible`,
        '☐ Technical assistance plan is documented',
      ]},
      { category: 'Annual Review', items: [
        '☐ Key holder information updated annually',
        '☐ Bitcoin valuation reviewed',
        '☐ Resilience score recalculated',
        '☐ Estate plan amendments made if needed',
        '☐ Client understands recovery process',
      ]}
    ]

    checklist.forEach(section => {
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage()
      }

      this.doc.setFillColor(249, 250, 251)
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(section.category, this.margin + 5, this.currentY + 7)
      this.currentY += 15

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      section.items.forEach(item => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(item, this.margin + 5, this.currentY)
        this.currentY += 6
      })
      this.currentY += 5
    })
  }

  /**
   * Signature Pages
   */
  private addSignaturePages(setup: MultisigSetup) {
    this.addSectionHeader('Acknowledgment & Signature')

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    const ackText = [
      `I, the undersigned, acknowledge that I have reviewed this Attorney Summary for ${setup.family}`,
      `and understand the multisignature Bitcoin wallet structure described herein. I confirm that:`,
      '',
      `• The ${setup.threshold}-of-${setup.totalKeys} multisignature configuration is accurately described`,
      '• Key holder contact information has been provided and verified',
      '• I have reviewed the inheritance flow and succession plan',
      '• I will incorporate appropriate language into trust/will documents',
      '• I understand this document contains NO private keys or access credentials',
    ]

    ackText.forEach(line => {
      this.doc.text(line, this.margin, this.currentY, {
        maxWidth: this.pageWidth - 2 * this.margin
      })
      this.currentY += line === '' ? 3 : 6
    })

    this.currentY += 15

    // Signature blocks
    const signatures = [
      { title: 'Client Signature', name: setup.family },
      { title: 'Attorney Signature', name: '[Attorney Name]' }
    ]

    signatures.forEach(sig => {
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage()
      }

      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(sig.title.toUpperCase(), this.margin, this.currentY)
      this.currentY += 10

      // Signature line
      this.doc.setLineWidth(0.5)
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
      this.currentY += 7

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      this.doc.text(`Name: ${sig.name}`, this.margin, this.currentY)
      this.currentY += 6
      this.doc.text(`Date: _______________`, this.margin, this.currentY)
      this.currentY += 15
    })
  }

  /**
   * Generate CPA Summary PDF
   * Tax-focused document for compliance and reporting
   */
  async generateCPASummary(options: PDFGenerationOptions): Promise<Blob> {
    const { setup, results, resilienceScore } = options

    // Reset document for new PDF
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.currentY = this.margin

    // Page 1: Cover page
    this.addCPACoverPage(setup, resilienceScore)

    // Page 2: Executive Summary for CPA
    this.addNewPage()
    this.addCPAExecutiveSummary(setup, results, resilienceScore)

    // Page 3: Tax Reporting Requirements
    this.addNewPage()
    this.addTaxReporting(setup)

    // Page 4: Cost Basis Tracking
    this.addNewPage()
    this.addCostBasisTracking(setup)

    // Page 5: Business Continuity
    this.addNewPage()
    this.addBusinessContinuity(setup)

    // Page 6: Annual Review Schedule
    this.addNewPage()
    this.addAnnualReviewSchedule(setup)

    // Page 7: Compliance Checklist
    this.addNewPage()
    this.addComplianceChecklist(setup)

    return this.doc.output('blob')
  }

  /**
   * CPA Cover Page
   */
  private addCPACoverPage(setup: MultisigSetup, resilienceScore: number) {
    // Header bar
    this.doc.setFillColor(17, 24, 39) // gray-900
    this.doc.rect(0, 0, this.pageWidth, 80, 'F')

    // Title
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(32)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('CPA Summary', this.pageWidth / 2, 35, { align: 'center' })

    // Subtitle
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Bitcoin Tax Reporting & Compliance Guide', this.pageWidth / 2, 50, { align: 'center' })

    // KeepNexus branding
    this.doc.setFontSize(10)
    this.doc.text('Powered by KeepNexus', this.pageWidth / 2, 65, { align: 'center' })

    // Client info box
    this.doc.setTextColor(0, 0, 0)
    this.currentY = 100

    this.doc.setFillColor(249, 250, 251) // gray-50
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 70, 3, 3, 'F')

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Client:', this.margin + 10, this.currentY + 15)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(setup.family, this.margin + 40, this.currentY + 15)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Asset Type:', this.margin + 10, this.currentY + 30)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Bitcoin (Digital Currency)', this.margin + 40, this.currentY + 30)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Structure:', this.margin + 10, this.currentY + 45)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`${setup.threshold}-of-${setup.totalKeys} Multisignature Wallet`, this.margin + 40, this.currentY + 45)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Tax Year:', this.margin + 10, this.currentY + 60)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(new Date().getFullYear().toString(), this.margin + 40, this.currentY + 60)

    // Important notice
    this.currentY = this.pageHeight - 90
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('CPA USE ONLY', this.pageWidth / 2, this.currentY, { align: 'center' })

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    const notice = [
      'This document contains NO private keys, transaction history, or Bitcoin balances.',
      'It provides tax and compliance context for Bitcoin holdings.',
      'Review with client and update annually for tax reporting purposes.',
      'Store securely with client\'s tax records and financial documents.',
    ]
    notice.forEach((line, i) => {
      this.doc.text(line, this.pageWidth / 2, this.currentY + 10 + i * 6, { align: 'center' })
    })

    // Footer
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, this.pageWidth / 2, this.pageHeight - 15, { align: 'center' })
    this.doc.setTextColor(0, 0, 0)
  }

  /**
   * CPA Executive Summary
   */
  private addCPAExecutiveSummary(setup: MultisigSetup, results: SimulationResult[], resilienceScore: number) {
    this.addSectionHeader('Executive Summary')

    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')

    const summary = [
      `This document provides tax and compliance context for ${setup.family}'s Bitcoin holdings.`,
      `The Bitcoin is secured using a ${setup.threshold}-of-${setup.totalKeys} multisignature wallet structure.`,
      '',
      'KEY TAX CONSIDERATIONS:',
      '',
      '1. ASSET CLASSIFICATION (IRS)',
      '   • Bitcoin is treated as property, not currency',
      '   • Subject to capital gains tax on disposition',
      '   • Basis tracking required for all acquisitions',
      '   • Form 8949 and Schedule D required for sales',
      '',
      '2. REPORTING REQUIREMENTS',
      '   • Form 1040: Digital asset question must be answered',
      '   • FBAR: Not required (Bitcoin is not a foreign account)',
      '   • Form 8938: May be required if total assets exceed threshold',
      '   • State tax: Varies by jurisdiction',
      '',
      '3. ESTATE & GIFT TAX',
      '   • Fair market value at date of death for estate tax',
      '   • Step-up in basis applies to inherited Bitcoin',
      '   • Gift tax applies to lifetime transfers over annual exclusion',
      `   • Current resilience: ${resilienceScore}% (access risk for estate administration)`,
    ]

    summary.forEach(line => {
      if (this.currentY > this.pageHeight - 40) {
        this.addNewPage()
      }
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += line === '' ? 3 : 6
    })
  }

  /**
   * Tax Reporting Requirements
   */
  private addTaxReporting(setup: MultisigSetup) {
    this.addSectionHeader('Tax Reporting Requirements')

    this.doc.setFontSize(10)
    this.doc.text('Annual tax reporting checklist for Bitcoin holdings:', this.margin, this.currentY)
    this.currentY += 10

    const sections = [
      {
        title: 'FORM 1040 - Digital Asset Question',
        content: [
          'Question: "At any time during 2024, did you: (a) receive (as a reward, award, or payment',
          'for property or services); or (b) sell, exchange, or otherwise dispose of a digital asset?"',
          '',
          'Answer YES if:',
          '• Bitcoin was sold or exchanged for cash or other property',
          '• Bitcoin was used to purchase goods or services',
          '• Bitcoin was received as payment or reward',
          '',
          'Answer NO if:',
          '• Bitcoin was only held in wallet (no transactions)',
          '• Bitcoin was transferred between own wallets',
        ]
      },
      {
        title: 'FORM 8949 - Sales and Dispositions',
        content: [
          'Required when Bitcoin is sold or exchanged. Report:',
          '',
          '• Date acquired',
          '• Date sold or disposed',
          '• Proceeds (fair market value at disposition)',
          '• Cost basis (purchase price + fees)',
          '• Gain or loss (proceeds - cost basis)',
          '',
          'Holding period:',
          '• Short-term: Held 1 year or less (ordinary income rates)',
          '• Long-term: Held more than 1 year (capital gains rates)',
        ]
      },
      {
        title: 'SCHEDULE D - Capital Gains Summary',
        content: [
          'Summarize Form 8949 transactions:',
          '',
          '• Total short-term capital gains/losses',
          '• Total long-term capital gains/losses',
          '• Net capital gain or loss',
          '',
          'Transfer to Form 1040 Schedule 1 (if applicable)',
        ]
      }
    ]

    sections.forEach(section => {
      if (this.currentY > this.pageHeight - 80) {
        this.addNewPage()
      }

      this.doc.setFillColor(249, 250, 251)
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(section.title, this.margin + 5, this.currentY + 7)
      this.currentY += 15

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      section.content.forEach(line => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(line, this.margin + 5, this.currentY, {
          maxWidth: this.pageWidth - 2 * this.margin - 10
        })
        this.currentY += line === '' ? 3 : 5
      })
      this.currentY += 8
    })
  }

  /**
   * Cost Basis Tracking
   */
  private addCostBasisTracking(setup: MultisigSetup) {
    this.addSectionHeader('Cost Basis Tracking')

    this.doc.setFontSize(10)
    this.doc.text('Recommended methods for tracking Bitcoin cost basis:', this.margin, this.currentY)
    this.currentY += 10

    // Cost basis methods table
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Method', 'Description', 'Best For']],
      body: [
        [
          'FIFO',
          'First In, First Out\nOldest Bitcoin sold first',
          'Most common default method.\nSimple to calculate.'
        ],
        [
          'LIFO',
          'Last In, First Out\nNewest Bitcoin sold first',
          'May reduce taxable gains\nif recent purchases higher.'
        ],
        [
          'Specific ID',
          'Identify exact Bitcoin\nunits being sold',
          'Maximum tax optimization.\nRequires detailed records.'
        ],
        [
          'HIFO',
          'Highest In, First Out\nHighest basis sold first',
          'Minimizes capital gains.\nRequires software tracking.'
        ]
      ],
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 60 },
        2: { cellWidth: 65 }
      }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15

    // Record keeping requirements
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(11)
    this.doc.text('Record Keeping Requirements', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    const records = [
      'Maintain the following documentation for each Bitcoin acquisition:',
      '',
      '• Date of acquisition',
      '• Amount of Bitcoin acquired (to 8 decimal places)',
      '• Purchase price in USD',
      '• Transaction fees paid',
      '• Exchange or platform used',
      '• Wallet address (for verification)',
      '',
      'For sales/dispositions, also record:',
      '',
      '• Date of sale or disposition',
      '• Amount of Bitcoin sold/exchanged',
      '• Fair market value in USD at time of disposition',
      '• Transaction fees paid',
      '• Method used to determine cost basis',
    ]

    records.forEach(line => {
      if (this.currentY > this.pageHeight - 40) {
        this.addNewPage()
      }
      this.doc.text(line, this.margin + 5, this.currentY)
      this.currentY += line === '' ? 3 : 5
    })

    this.currentY += 10

    // Important notice
    this.doc.setFillColor(254, 243, 199) // yellow-100
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 3, 3, 'F')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('⚠ CPA RECOMMENDATION:', this.margin + 5, this.currentY + 8)
    this.doc.setFont('helvetica', 'normal')
    const notice = [
      'Use cryptocurrency tax software (CoinTracker, TaxBit, etc.) for automated basis tracking.',
      'IRS requires contemporaneous records - document transactions at time they occur.',
      'Maintain records for at least 7 years after filing tax return.',
    ]
    notice.forEach((line, i) => {
      this.doc.text(line, this.margin + 5, this.currentY + 14 + i * 5, {
        maxWidth: this.pageWidth - 2 * this.margin - 10
      })
    })
  }

  /**
   * Business Continuity
   */
  private addBusinessContinuity(setup: MultisigSetup) {
    this.addSectionHeader('Business Continuity Checklist')

    this.doc.setFontSize(10)
    this.doc.text('CPA firm preparation for Bitcoin client management:', this.margin, this.currentY)
    this.currentY += 10

    const sections = [
      {
        category: 'Client Onboarding',
        items: [
          '☐ Client engagement letter includes cryptocurrency services',
          '☐ Cryptocurrency questionnaire completed annually',
          '☐ Access to transaction history secured',
          '☐ Multisig structure documented in client file',
          '☐ Key holder contact information on file',
        ]
      },
      {
        category: 'Annual Tax Prep',
        items: [
          '☐ Request transaction export from all exchanges/wallets',
          '☐ Reconcile total Bitcoin holdings year-over-year',
          '☐ Calculate realized gains/losses for the year',
          '☐ Verify cost basis calculations',
          '☐ Review holding periods (short vs. long-term)',
        ]
      },
      {
        category: 'Estate Planning Coordination',
        items: [
          '☐ Bitcoin included in estate tax valuation',
          '☐ Date-of-death valuation method determined',
          '☐ Step-up basis calculated for beneficiaries',
          '☐ Executor has access to recovery information',
          `☐ Multisig structure (${setup.threshold}-of-${setup.keys.length}) documented`,
        ]
      },
      {
        category: 'Compliance & Risk',
        items: [
          '☐ State-specific crypto tax rules reviewed',
          '☐ Large transaction reporting (if applicable)',
          '☐ Gift tax returns filed (if lifetime transfers)',
          '☐ Foreign account reporting reviewed (typically N/A)',
          '☐ IRS audit defense documentation prepared',
        ]
      }
    ]

    sections.forEach(section => {
      if (this.currentY > this.pageHeight - 70) {
        this.addNewPage()
      }

      this.doc.setFillColor(249, 250, 251)
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(section.category, this.margin + 5, this.currentY + 7)
      this.currentY += 15

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      section.items.forEach(item => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(item, this.margin + 5, this.currentY)
        this.currentY += 6
      })
      this.currentY += 8
    })
  }

  /**
   * Annual Review Schedule
   */
  private addAnnualReviewSchedule(setup: MultisigSetup) {
    this.addSectionHeader('Annual Review Schedule')

    this.doc.setFontSize(10)
    this.doc.text('Recommended timeline for Bitcoin client tax planning:', this.margin, this.currentY)
    this.currentY += 10

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Timeframe', 'Task', 'Action Items']],
      body: [
        [
          'Q4 (Oct-Dec)',
          'Year-End Planning',
          '• Review unrealized gains/losses\n• Tax loss harvesting opportunities\n• Gift planning (if applicable)'
        ],
        [
          'Jan 15',
          'Transaction Export',
          '• Request full-year transaction data\n• Verify all exchanges/wallets included\n• Begin basis calculations'
        ],
        [
          'Feb 1',
          'Draft Returns',
          '• Complete Form 8949\n• Calculate capital gains\n• Review for accuracy'
        ],
        [
          'Mar 1',
          'Client Review',
          '• Present draft return to client\n• Verify transactions\n• Address questions'
        ],
        [
          'Apr 15',
          'Filing Deadline',
          '• File federal and state returns\n• Pay estimated taxes if needed\n• Extension if necessary'
        ],
        [
          'Ongoing',
          'Quarterly Check-In',
          '• Monitor large transactions\n• Update estate plan value\n• Resilience score review'
        ]
      ],
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 45 },
        2: { cellWidth: 85 }
      }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15

    // Client communication notes
    this.doc.setFillColor(239, 246, 255) // blue-50
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 3, 3, 'F')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('CLIENT COMMUNICATION TIPS:', this.margin + 5, this.currentY + 8)
    this.doc.setFont('helvetica', 'normal')
    const tips = [
      '• Send annual cryptocurrency questionnaire in December',
      '• Educate client on capital gains vs. ordinary income treatment',
      '• Remind client that Bitcoin-to-Bitcoin trades are taxable events',
      '• Discuss tax loss harvesting strategies in Q4',
      '• Coordinate with estate planning attorney for valuation updates',
      '• Review multisig access annually - ensure heirs can recover',
    ]
    tips.forEach((tip, i) => {
      this.doc.text(tip, this.margin + 5, this.currentY + 14 + i * 5, {
        maxWidth: this.pageWidth - 2 * this.margin - 10
      })
    })
  }

  /**
   * Compliance Checklist
   */
  private addComplianceChecklist(setup: MultisigSetup) {
    this.addSectionHeader('Compliance Documentation')

    this.doc.setFontSize(10)
    this.doc.text('CPA checklist for Bitcoin tax compliance:', this.margin, this.currentY)
    this.currentY += 10

    const checklist = [
      {
        category: 'Transaction Records',
        items: [
          '☐ All exchange transaction exports obtained',
          '☐ Wallet transaction history documented',
          '☐ Cost basis calculated for all acquisitions',
          '☐ Holding periods verified (short vs. long-term)',
          '☐ Transaction fees included in basis calculations',
        ]
      },
      {
        category: 'Form Completion',
        items: [
          '☐ Form 1040 digital asset question answered',
          '☐ Form 8949 completed with all dispositions',
          '☐ Schedule D capital gains summary prepared',
          '☐ Form 8938 (if foreign assets exceed threshold)',
          '☐ State tax forms filed (varies by jurisdiction)',
        ]
      },
      {
        category: 'Estate & Gift',
        items: [
          '☐ Annual valuation documented',
          '☐ Gift tax returns filed (if applicable)',
          '☐ Estate tax calculation includes Bitcoin',
          '☐ Step-up basis documented for inherited Bitcoin',
          `☐ Multisig recovery plan reviewed (${setup.threshold}-of-${setup.keys.length})`,
        ]
      },
      {
        category: 'Audit Defense',
        items: [
          '☐ Contemporaneous records maintained',
          '☐ Exchange/wallet statements saved',
          '☐ Cost basis methodology documented',
          '☐ Third-party software reports retained',
          '☐ All documentation stored for 7+ years',
        ]
      }
    ]

    checklist.forEach(section => {
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage()
      }

      this.doc.setFillColor(249, 250, 251)
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(section.category, this.margin + 5, this.currentY + 7)
      this.currentY += 15

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      section.items.forEach(item => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(item, this.margin + 5, this.currentY)
        this.currentY += 6
      })
      this.currentY += 5
    })

    this.currentY += 10

    // Important disclaimer
    this.doc.setFillColor(254, 226, 226) // red-100
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 3, 3, 'F')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('IMPORTANT DISCLAIMER:', this.margin + 5, this.currentY + 8)
    this.doc.setFont('helvetica', 'normal')
    const disclaimer = [
      'Cryptocurrency tax rules are rapidly evolving. This document provides general guidance',
      'based on current IRS regulations. Always consult IRS publications and seek professional',
      'tax advice for specific situations. State and local tax rules may differ.',
    ]
    disclaimer.forEach((line, i) => {
      this.doc.text(line, this.margin + 5, this.currentY + 14 + i * 5, {
        maxWidth: this.pageWidth - 2 * this.margin - 10
      })
    })
  }

  /**
   * Generate Technical Implementation Guide PDF
   * Step-by-step wallet setup instructions for technical implementers
   */
  async generateTechnicalGuide(options: PDFGenerationOptions): Promise<Blob> {
    const { setup, results, resilienceScore } = options

    // Reset document for new PDF
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.currentY = this.margin

    // Page 1: Cover page
    this.addTechnicalCoverPage(setup, resilienceScore)

    // Page 2: Executive Summary
    this.addNewPage()
    this.addTechnicalExecutiveSummary(setup, results, resilienceScore)

    // Page 3: Prerequisites & Requirements
    this.addNewPage()
    this.addPrerequisites(setup)

    // Page 4-5: Multisig Wallet Setup
    this.addNewPage()
    this.addWalletSetup(setup)

    // Page 6: Key Generation Procedures
    this.addNewPage()
    this.addKeyGeneration(setup)

    // Page 7: Test Transaction
    this.addNewPage()
    this.addTestTransaction(setup)

    // Page 8: Recovery Drill
    this.addNewPage()
    this.addRecoveryDrill(setup)

    // Page 9: Troubleshooting
    this.addNewPage()
    this.addTroubleshooting(setup)

    return this.doc.output('blob')
  }

  /**
   * Technical Cover Page
   */
  private addTechnicalCoverPage(setup: MultisigSetup, resilienceScore: number) {
    // Header bar
    this.doc.setFillColor(17, 24, 39)
    this.doc.rect(0, 0, this.pageWidth, 80, 'F')

    // Title
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(32)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Technical Implementation Guide', this.pageWidth / 2, 30, { align: 'center' })

    // Subtitle
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Multisig Wallet Setup Instructions', this.pageWidth / 2, 50, { align: 'center' })

    // KeepNexus branding
    this.doc.setFontSize(10)
    this.doc.text('Powered by KeepNexus', this.pageWidth / 2, 65, { align: 'center' })

    // Configuration box
    this.doc.setTextColor(0, 0, 0)
    this.currentY = 100

    this.doc.setFillColor(249, 250, 251)
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 85, 3, 3, 'F')

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Client:', this.margin + 10, this.currentY + 15)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(setup.family, this.margin + 45, this.currentY + 15)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Configuration:', this.margin + 10, this.currentY + 30)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`${setup.threshold}-of-${setup.totalKeys} Multisignature Wallet`, this.margin + 45, this.currentY + 30)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Total Keys:', this.margin + 10, this.currentY + 45)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`${setup.keys.length} independent signers`, this.margin + 45, this.currentY + 45)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Required Sigs:', this.margin + 10, this.currentY + 60)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Minimum ${setup.threshold} signatures to spend`, this.margin + 45, this.currentY + 60)

    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Resilience:', this.margin + 10, this.currentY + 75)
    this.doc.setFont('helvetica', 'normal')
    const scoreColor = resilienceScore >= 80 ? [34, 197, 94] : resilienceScore >= 60 ? [234, 179, 8] : [239, 68, 68]
    this.doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    this.doc.text(`${resilienceScore}% (${resilienceScore >= 80 ? 'Excellent' : resilienceScore >= 60 ? 'Good' : 'Needs Improvement'})`, this.margin + 45, this.currentY + 75)
    this.doc.setTextColor(0, 0, 0)

    // Important notice
    this.currentY = this.pageHeight - 100
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('TECHNICAL IMPLEMENTER USE ONLY', this.pageWidth / 2, this.currentY, { align: 'center' })

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    const notice = [
      'This document provides technical setup instructions for Bitcoin multisig wallets.',
      'Follow all steps carefully and verify each action before proceeding.',
      'NEVER share seed phrases, private keys, or backup files electronically.',
      'Test recovery process with small amounts before depositing significant funds.',
      'Keep this document secure - it contains sensitive configuration information.',
    ]
    notice.forEach((line, i) => {
      this.doc.text(line, this.pageWidth / 2, this.currentY + 10 + i * 6, { align: 'center' })
    })

    // Footer
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, this.pageWidth / 2, this.pageHeight - 15, { align: 'center' })
    this.doc.setTextColor(0, 0, 0)
  }

  /**
   * Technical Executive Summary
   */
  private addTechnicalExecutiveSummary(setup: MultisigSetup, results: SimulationResult[], resilienceScore: number) {
    this.addSectionHeader('Executive Summary')

    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')

    const summary = [
      `This guide provides step-by-step instructions for setting up ${setup.family}'s`,
      `${setup.threshold}-of-${setup.totalKeys} multisignature Bitcoin wallet. Multisig wallets require multiple signatures`,
      'to authorize transactions, providing enhanced security and redundancy.',
      '',
      'KEY TECHNICAL SPECIFICATIONS:',
      '',
      '• Wallet Type: Bitcoin Native Segwit (P2WSH) Multisig',
      `• Signature Threshold: ${setup.threshold} of ${setup.keys.length} required`,
      '• Address Format: bc1... (Bech32)',
      '• Network: Bitcoin Mainnet (verify before use)',
      `• Resilience Score: ${resilienceScore}% (${results.filter(r => r.outcome === 'recoverable').length}/${results.length} scenarios recoverable)`,
      '',
      'IMPLEMENTATION OVERVIEW:',
      '',
      '1. Install and verify wallet software',
      '2. Generate extended public keys (xpubs) for each signer',
      '3. Create multisig wallet configuration',
      '4. Verify receive addresses match across all signers',
      '5. Perform test transaction (small amount)',
      '6. Execute recovery drill to verify backup procedures',
      '7. Document all setup details securely',
    ]

    summary.forEach(line => {
      if (this.currentY > this.pageHeight - 40) {
        this.addNewPage()
      }
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += line === '' ? 3 : 6
    })
  }

  /**
   * Prerequisites & Requirements
   */
  private addPrerequisites(setup: MultisigSetup) {
    this.addSectionHeader('Prerequisites & Requirements')

    this.doc.setFontSize(10)
    this.doc.text('Required tools and preparation before setup:', this.margin, this.currentY)
    this.currentY += 10

    const sections = [
      {
        title: 'SOFTWARE OPTIONS (Choose One)',
        items: [
          'Option 1: Sparrow Wallet (Recommended for Desktop)',
          '  • Download: sparrowwallet.com',
          '  • Platforms: Windows, macOS, Linux',
          '  • Features: Full multisig support, PSBT, hardware wallet integration',
          '',
          'Option 2: Electrum',
          '  • Download: electrum.org',
          '  • Platforms: Windows, macOS, Linux, Android',
          '  • Features: Advanced features, command-line support',
          '',
          'Option 3: Unchained Capital (Custodian-Assisted)',
          '  • Website: unchained.com',
          '  • Features: Professional custody, concierge setup',
          '  • Best for: High net worth, institutional holdings',
        ]
      },
      {
        title: 'HARDWARE REQUIREMENTS',
        items: [
          `• ${setup.keys.length} hardware wallets (one per key holder)`,
          '  Recommended: Coldcard, Ledger, Trezor, Foundation Passport',
          '• Computer(s) with internet connection for coordination',
          '• USB cables for hardware wallet connections',
          '• Secure offline computer (optional, for air-gapped keys)',
          '• Metal backup plates (optional, for seed phrase storage)',
        ]
      },
      {
        title: 'SECURITY PREPARATION',
        items: [
          '☐ Verify wallet software authenticity (GPG signatures)',
          '☐ Install on clean, malware-free computer',
          '☐ Disable network connection for key generation (optional)',
          '☐ Prepare secure storage locations for seed phrases',
          '☐ Have pen/paper ready for writing seed words',
          '☐ Ensure private space (no cameras, no observers)',
        ]
      }
    ]

    sections.forEach(section => {
      if (this.currentY > this.pageHeight - 100) {
        this.addNewPage()
      }

      this.doc.setFillColor(249, 250, 251)
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(section.title, this.margin + 5, this.currentY + 7)
      this.currentY += 15

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      section.items.forEach(item => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(item, this.margin + 5, this.currentY, {
          maxWidth: this.pageWidth - 2 * this.margin - 10
        })
        this.currentY += item === '' ? 3 : 5
      })
      this.currentY += 8
    })
  }

  /**
   * Multisig Wallet Setup
   */
  private addWalletSetup(setup: MultisigSetup) {
    this.addSectionHeader('Step-by-Step Multisig Wallet Setup')

    this.doc.setFontSize(10)
    this.doc.text('Follow these steps to create the multisig wallet:', this.margin, this.currentY)
    this.currentY += 10

    const steps = [
      {
        step: 'STEP 1: Coordinate Key Holders',
        instructions: [
          `• Schedule setup meeting with all ${setup.keys.length} key holders`,
          '• Verify each holder has hardware wallet and software installed',
          '• Share this technical guide with all participants',
          '• Designate one person as "coordinator" to create wallet',
        ]
      },
      {
        step: 'STEP 2: Generate Extended Public Keys (xpubs)',
        instructions: [
          'Each key holder must:',
          '1. Connect hardware wallet to computer',
          '2. Open wallet software (Sparrow/Electrum)',
          '3. Navigate to: Settings > Script Type > Native Segwit (P2WSH)',
          '4. Export xpub (extended public key)',
          '5. Share xpub with coordinator ONLY (NOT seed phrase!)',
          '',
          'Example xpub format:',
          'xpub6CatWdiZiodmUeTDp8LT5or8nmbKNcuyvz7WyksVFkKB4RHwCD3XyuvPEbvqAQY3rAPshWcMLoP2fMFMKHPJ4ZeZXYVUhLv1VMrjPC7PW6V',
        ]
      },
      {
        step: 'STEP 3: Create Multisig Wallet (Coordinator)',
        instructions: [
          'Coordinator creates the multisig wallet:',
          '1. Open Sparrow Wallet',
          '2. File > New Wallet > [Family Name]',
          `3. Select "Multi Signature" and set ${setup.threshold}/${setup.keys.length}`,
          '4. Add each xpub from key holders:',
          ...setup.keys.map((key, i) => `   Cosigner ${i + 1}: ${key.holder}`),
          '5. Name each cosigner for clarity',
          '6. Click "Apply" to create wallet',
          '7. Verify wallet fingerprint matches across all participants',
        ]
      },
      {
        step: 'STEP 4: Import Multisig to All Key Holders',
        instructions: [
          'Coordinator exports wallet configuration:',
          '1. Settings > Export > Output Descriptor',
          '2. Share descriptor with all key holders (secure channel)',
          '',
          'Each key holder imports:',
          '1. Open wallet software',
          '2. File > Import Wallet',
          '3. Paste output descriptor',
          '4. Connect hardware wallet to sign/verify',
          '5. Confirm same first receive address as coordinator',
        ]
      },
      {
        step: 'STEP 5: Verify Configuration',
        instructions: [
          'All participants must verify:',
          `☐ Wallet shows ${setup.threshold}-of-${setup.keys.length} configuration`,
          '☐ First receive address matches across all participants',
          '☐ Wallet fingerprint is identical',
          '☐ All cosigners are listed correctly',
          '☐ Hardware wallet shows correct multisig policy',
        ]
      }
    ]

    steps.forEach((section, index) => {
      if (this.currentY > this.pageHeight - 100 || (index > 0 && this.currentY > this.pageHeight - 140)) {
        this.addNewPage()
      }

      this.doc.setFillColor(17, 24, 39)
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
      this.doc.setTextColor(255, 255, 255)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(section.step, this.margin + 5, this.currentY + 7)
      this.doc.setTextColor(0, 0, 0)
      this.currentY += 15

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      section.instructions.forEach(line => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(line, this.margin + 5, this.currentY, {
          maxWidth: this.pageWidth - 2 * this.margin - 10
        })
        this.currentY += line === '' ? 3 : 5
      })
      this.currentY += 10
    })
  }

  /**
   * Key Generation Procedures
   */
  private addKeyGeneration(setup: MultisigSetup) {
    this.addSectionHeader('Key Generation & Backup Procedures')

    this.doc.setFontSize(10)
    this.doc.text('CRITICAL: Proper key generation and backup is essential for security.', this.margin, this.currentY)
    this.currentY += 10

    // Key holder instructions table
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Key Holder', 'Storage Type', 'Backup Instructions']],
      body: setup.keys.map((key) => [
        key.holder,
        key.storage.replace('-', ' '),
        key.storage === 'hardware-wallet'
          ? 'Write 24-word seed phrase on paper.\nStore in fireproof safe or safe deposit box.'
          : key.storage === 'custodian'
            ? 'Custodian manages key backup.\nVerify their backup procedures and insurance.'
            : 'Generate key on air-gapped device.\nWrite seed phrase on metal backup plate.'
      ]),
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 45 },
        2: { cellWidth: 75 }
      }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15

    // Security best practices
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(11)
    this.doc.text('Security Best Practices', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    const practices = [
      'DO:',
      '✓ Write seed phrases by hand (never digital)',
      '✓ Verify each word against BIP39 word list',
      '✓ Store backups in separate physical locations',
      '✓ Test recovery process before depositing funds',
      '✓ Use metal backup plates for fire/water resistance',
      '',
      'DO NOT:',
      '✗ Take photos of seed phrases',
      '✗ Store seeds in cloud services or email',
      '✗ Share seeds via text/messaging apps',
      '✗ Store all seeds in same location',
      '✗ Trust anyone who asks for your seed phrase',
    ]

    practices.forEach(line => {
      if (this.currentY > this.pageHeight - 40) {
        this.addNewPage()
      }
      this.doc.text(line, this.margin + 5, this.currentY)
      this.currentY += line === '' ? 3 : 5
    })

    this.currentY += 10

    // Critical warning
    this.doc.setFillColor(254, 226, 226) // red-100
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 3, 3, 'F')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('⚠️ CRITICAL WARNING:', this.margin + 5, this.currentY + 8)
    this.doc.setFont('helvetica', 'normal')
    const warning = [
      'Loss of seed phrases = permanent loss of Bitcoin. There is NO recovery if seeds are lost.',
      `With ${setup.threshold}-of-${setup.keys.length} multisig, you must maintain access to at least ${setup.threshold} keys.`,
      'Treat seed phrases like bearer bonds - whoever has them controls the Bitcoin.',
    ]
    warning.forEach((line, i) => {
      this.doc.text(line, this.margin + 5, this.currentY + 14 + i * 5, {
        maxWidth: this.pageWidth - 2 * this.margin - 10
      })
    })
  }

  /**
   * Test Transaction
   */
  private addTestTransaction(setup: MultisigSetup) {
    this.addSectionHeader('Test Transaction Walkthrough')

    this.doc.setFontSize(10)
    this.doc.text('Always test with small amounts before depositing significant funds:', this.margin, this.currentY)
    this.currentY += 10

    const testSteps = [
      {
        phase: 'PHASE 1: Receive Test (Deposit)',
        steps: [
          '1. Coordinator generates new receive address in wallet',
          '2. Verify address matches on all key holders\' devices',
          '3. Send small test amount (e.g., 0.001 BTC or $50) to address',
          '4. Wait for 1 confirmation (~10 minutes)',
          '5. Verify transaction appears in all participants\' wallets',
          '6. Confirm balance is correct',
        ]
      },
      {
        phase: 'PHASE 2: Send Test (Spend)',
        steps: [
          `1. Create transaction to send test amount to different address`,
          '2. Coordinator creates unsigned transaction (PSBT)',
          `3. PSBT must be signed by ${setup.threshold} key holders:`,
          ...setup.keys.slice(0, setup.threshold).map((key, i) =>
            `   Signer ${i + 1}: ${key.holder} connects hardware wallet and signs`
          ),
          `4. After ${setup.threshold} signatures collected, broadcast transaction`,
          '5. Wait for confirmation',
          '6. Verify transaction succeeded on blockchain explorer',
        ]
      },
      {
        phase: 'PHASE 3: Verification',
        steps: [
          '☐ Test receive address generated correctly',
          '☐ Test send transaction completed successfully',
          `☐ Verified ${setup.threshold} signatures required (not more, not less)`,
          '☐ All key holders can view transaction history',
          '☐ Hardware wallets show correct signing policy',
          '☐ Transaction fees were reasonable',
        ]
      }
    ]

    testSteps.forEach(section => {
      if (this.currentY > this.pageHeight - 80) {
        this.addNewPage()
      }

      this.doc.setFillColor(249, 250, 251)
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(section.phase, this.margin + 5, this.currentY + 7)
      this.currentY += 15

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      section.steps.forEach(step => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(step, this.margin + 5, this.currentY)
        this.currentY += 5
      })
      this.currentY += 8
    })

    // Important note
    this.doc.setFillColor(254, 243, 199) // yellow-100
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 3, 3, 'F')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('💡 TIP:', this.margin + 5, this.currentY + 8)
    this.doc.setFont('helvetica', 'normal')
    const tip = [
      'Keep test transaction amounts low. The goal is to verify the setup works, not to risk significant funds.',
      'Document the test transaction ID (txid) for your records.',
    ]
    tip.forEach((line, i) => {
      this.doc.text(line, this.margin + 12, this.currentY + 8 + i * 5, {
        maxWidth: this.pageWidth - 2 * this.margin - 17
      })
    })
  }

  /**
   * Recovery Drill
   */
  private addRecoveryDrill(setup: MultisigSetup) {
    this.addSectionHeader('Recovery Drill Instructions')

    this.doc.setFontSize(10)
    this.doc.text('Execute this drill annually to verify backup procedures work:', this.margin, this.currentY)
    this.currentY += 10

    const drillSteps = [
      {
        scenario: 'DRILL 1: Lost Wallet File',
        objective: 'Verify wallet can be recovered from seed phrases and output descriptor',
        steps: [
          '1. On NEW computer, install fresh wallet software',
          '2. Import multisig wallet using output descriptor',
          '3. Connect hardware wallet with seed phrase',
          '4. Verify wallet shows correct balance and transaction history',
          '5. Generate receive address and verify it matches original',
          'Success: Wallet fully recovered with all history',
        ]
      },
      {
        scenario: `DRILL 2: ${setup.keys[0]?.holder || 'Key Holder 1'} Unavailable`,
        objective: `Verify funds can be accessed with remaining ${setup.threshold} keys`,
        steps: [
          `1. Simulate ${setup.keys[0]?.holder || 'primary key holder'} being unavailable`,
          `2. Identify ${setup.threshold} alternative signers:`,
          ...setup.keys.slice(1, setup.threshold + 1).map(key => `   • ${key.holder}`),
          '3. Create test transaction',
          '4. Collect signatures from alternate signers',
          '5. Broadcast transaction',
          'Success: Funds accessed without unavailable key',
        ]
      },
      {
        scenario: 'DRILL 3: Hardware Wallet Replacement',
        objective: 'Verify seed phrase can restore wallet to new device',
        steps: [
          '1. Obtain new hardware wallet (same model preferred)',
          '2. Initialize device and select "Restore from seed"',
          '3. Enter 24-word seed phrase carefully',
          '4. Verify seed phrase matches using device checksum',
          '5. Import multisig configuration',
          '6. Verify first address matches original',
          'Success: New hardware wallet can sign transactions',
        ]
      }
    ]

    drillSteps.forEach(drill => {
      if (this.currentY > this.pageHeight - 100) {
        this.addNewPage()
      }

      this.doc.setFillColor(239, 246, 255) // blue-50
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F')
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(drill.scenario, this.margin + 5, this.currentY + 7)
      this.currentY += 15

      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'italic')
      this.doc.text(`Objective: ${drill.objective}`, this.margin + 5, this.currentY)
      this.currentY += 7

      this.doc.setFont('helvetica', 'normal')
      drill.steps.forEach(step => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(step, this.margin + 5, this.currentY, {
          maxWidth: this.pageWidth - 2 * this.margin - 10
        })
        this.currentY += 5
      })
      this.currentY += 10
    })

    // Drill schedule
    this.doc.setFillColor(249, 250, 251)
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 3, 3, 'F')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('RECOMMENDED DRILL SCHEDULE:', this.margin + 5, this.currentY + 8)
    this.doc.setFont('helvetica', 'normal')
    const schedule = [
      '• Drill 1 (Lost Wallet): Annually on anniversary of setup',
      '• Drill 2 (Unavailable Key): Every 6 months',
      '• Drill 3 (Device Replacement): As needed, or every 2 years',
    ]
    schedule.forEach((line, i) => {
      this.doc.text(line, this.margin + 5, this.currentY + 14 + i * 5)
    })
  }

  /**
   * Troubleshooting
   */
  private addTroubleshooting(setup: MultisigSetup) {
    this.addSectionHeader('Troubleshooting Common Issues')

    this.doc.setFontSize(10)
    this.doc.text('Solutions to common multisig setup problems:', this.margin, this.currentY)
    this.currentY += 10

    const issues = [
      {
        problem: 'Receive addresses don\'t match across devices',
        solution: [
          '• Verify all participants imported same output descriptor',
          `• Check that signature threshold is ${setup.threshold}-of-${setup.keys.length} on all devices`,
          '• Confirm xpub order is identical across all wallets',
          '• Restart wallet software and reconnect hardware wallets',
        ]
      },
      {
        problem: 'Cannot collect enough signatures',
        solution: [
          `• Verify you have access to at least ${setup.threshold} hardware wallets`,
          '• Check that all signers are using compatible wallet software',
          '• Ensure PSBT format is supported by all devices',
          '• Try signing one device at a time rather than parallel',
        ]
      },
      {
        problem: 'Hardware wallet shows "Policy not recognized"',
        solution: [
          '• Register multisig policy on hardware wallet first',
          '• Update hardware wallet firmware to latest version',
          '• Some devices require policy registration before signing',
          '• Consult hardware wallet documentation for multisig setup',
        ]
      },
      {
        problem: 'Lost output descriptor',
        solution: [
          '• If any participant still has wallet file, export descriptor again',
          '• Descriptor can be reconstructed from xpubs (all signers)',
          '• Contact KeepNexus advisor for assistance',
          '• As long as seeds are safe, funds are NOT lost',
        ]
      },
      {
        problem: 'Transaction fees too high',
        solution: [
          '• Multisig transactions are larger than single-sig',
          '• Use lower fee rate for non-urgent transactions',
          '• Consider transaction batching for multiple payments',
          '• SegWit addresses (bc1...) reduce fees significantly',
        ]
      }
    ]

    issues.forEach(issue => {
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage()
      }

      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(`ISSUE: ${issue.problem}`, this.margin, this.currentY)
      this.currentY += 7

      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(9)
      this.doc.text('Solutions:', this.margin, this.currentY)
      this.currentY += 5

      issue.solution.forEach(line => {
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage()
        }
        this.doc.text(line, this.margin + 5, this.currentY, {
          maxWidth: this.pageWidth - 2 * this.margin - 10
        })
        this.currentY += 5
      })
      this.currentY += 8
    })

    this.currentY += 5

    // Support contact
    this.doc.setFillColor(239, 246, 255) // blue-50
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 3, 3, 'F')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('NEED HELP?', this.margin + 5, this.currentY + 8)
    this.doc.setFont('helvetica', 'normal')
    const support = [
      'If you encounter issues not covered here:',
      '1. Consult your KeepNexus advisor',
      '2. Review wallet software documentation',
      '3. Join Bitcoin multisig communities for peer support',
      '4. NEVER share seed phrases or private keys with anyone claiming to help',
    ]
    support.forEach((line, i) => {
      this.doc.text(line, this.margin + 5, this.currentY + 14 + i * 4, {
        maxWidth: this.pageWidth - 2 * this.margin - 10
      })
    })
  }
}

export const pdfPlaybookGenerator = new PDFPlaybookGenerator()
