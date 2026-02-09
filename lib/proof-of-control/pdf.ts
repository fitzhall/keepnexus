/**
 * Proof of Control — PDF Renderer
 * Generates a clean PDF document from a ProofOfControlPacket.
 * Uses jsPDF + autoTable for structured table layout.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ProofOfControlPacket } from './generate'

export function generateProofPDF(packet: ProofOfControlPacket): jsPDF {
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 30

  // ── Cover / Header ──

  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  doc.text('NO SENSITIVE DATA INCLUDED', pageWidth / 2, y, { align: 'center' })
  y += 20

  doc.setFontSize(28)
  doc.setTextColor(39, 39, 42) // zinc-800
  doc.setFont('courier', 'bold')
  doc.text('PROOF OF CONTROL', pageWidth / 2, y, { align: 'center' })
  y += 12

  doc.setFontSize(14)
  doc.setTextColor(82, 82, 91) // zinc-600
  doc.setFont('courier', 'normal')
  doc.text(`${packet.family_name} Reserve`, pageWidth / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(9)
  doc.setTextColor(113, 113, 122) // zinc-500
  doc.text(`Generated ${formatDate(packet.generated_at)}`, pageWidth / 2, y, { align: 'center' })
  y += 6

  doc.setFontSize(8)
  doc.setFont('courier', 'normal')
  doc.text(`THAP: ${packet.thap_hash}`, pageWidth / 2, y, { align: 'center' })
  y += 12

  // Divider
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // ── Sections ──

  for (const section of packet.sections) {
    // Check if we need a new page (leave room for title + at least a few rows)
    if (y > 240) {
      doc.addPage()
      y = 30
    }

    // Section title
    doc.setFontSize(11)
    doc.setFont('courier', 'bold')
    doc.setTextColor(39, 39, 42)
    doc.text(section.title.toUpperCase(), margin, y)
    y += 4

    // Table
    autoTable(doc, {
      startY: y,
      head: [],
      body: section.rows.map(row => [row.label, row.value]),
      theme: 'plain',
      styles: {
        font: 'courier',
        fontSize: 9,
        textColor: [63, 63, 70],   // zinc-700
        cellPadding: 3,
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          cellWidth: 50,
          textColor: [82, 82, 91],  // zinc-600
        },
        1: {
          textColor: [39, 39, 42],  // zinc-800
        },
      },
      margin: { left: margin, right: margin },
    })

    // Get y position after autoTable
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ── Footer on every page ──

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('courier', 'normal')
    doc.setTextColor(161, 161, 170) // zinc-400
    doc.text(
      `Generated ${formatDate(packet.generated_at)} — No sensitive data included`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    )
  }

  return doc
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso.split('T')[0]
  }
}
