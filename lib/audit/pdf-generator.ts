import jsPDF from 'jspdf';

interface AuditReport {
  client?: string;
  current_state: {
    keep_score: number;
    holdings?: number;
    btc_value?: number;
    birs: number;
    tier?: string;
  };
  executive?: {
    executive_summary?: string;
    primary_concern?: string;
  };
  security?: {
    score?: number;
    gaps?: string[];
    analysis?: string;
  };
  legal?: {
    score?: number;
    gaps?: string[];
    analysis?: string;
  };
  access?: {
    score?: number;
    gaps?: string[];
    analysis?: string;
  };
  maintenance?: {
    score?: number;
    gaps?: string[];
    analysis?: string;
  };
  actions?: {
    priority_actions?: Array<{
      priority?: string;
      action: string;
      rationale: string;
      timeline?: string;
    }>;
    action?: string;
  };
}

/**
 * Generate comprehensive PDF report from audit analysis
 */
export async function generatePDF(report: AuditReport, formData: any): Promise<Buffer> {
  const doc = new jsPDF();

  const client = report.client || formData.full_name || 'Bitcoin Holder';
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper function for formatting currency
  const formatCurrency = (num: number): string => {
    return Math.round(num).toLocaleString();
  };

  // Helper function for multi-line text
  const addMultilineText = (text: string, x: number, y: number, maxWidth: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * 5);
  };

  let pageNum = 1;

  // ============ COVER PAGE ============
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('CONFIDENTIAL', 105, 20, { align: 'center' });

  doc.setFontSize(32);
  doc.setTextColor(0, 0, 0);
  doc.text('BITCOIN INHERITANCE', 105, 60, { align: 'center' });
  doc.text('SECURITY AUDIT', 105, 75, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('KEEP Framework Assessment', 105, 90, { align: 'center' });

  // Client info box
  doc.setDrawColor(200, 200, 200);
  doc.rect(40, 110, 130, 40);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Prepared For:', 50, 125);
  doc.setFont('helvetica', 'bold');
  doc.text(client, 50, 135);
  doc.setFont('helvetica', 'normal');
  doc.text(date, 50, 145);

  // KEEP Score highlight
  doc.setFillColor(220, 53, 69);
  doc.rect(60, 170, 90, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text(`KEEP SCORE: ${report.current_state.keep_score}/100`, 105, 190, { align: 'center' });

  // Risk amount
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(`Bitcoin at Risk: $${formatCurrency(report.current_state.birs)}`, 105, 220, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Report ID: ${formData.jobId || 'N/A'}`, 105, 280, { align: 'center' });
  doc.text(`Generated: ${new Date().toISOString()}`, 105, 285, { align: 'center' });

  // ============ EXECUTIVE SUMMARY PAGE ============
  doc.addPage();
  pageNum++;
  let y = 30;

  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('EXECUTIVE SUMMARY', 20, y);
  y += 15;

  // Key metrics box
  doc.setFillColor(245, 245, 245);
  doc.rect(20, y, 170, 45, 'F');

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  y += 10;

  const btcValue = report.current_state.holdings || report.current_state.btc_value || 0;
  const metrics: Array<[string, string]> = [
    ['Portfolio Value:', `$${formatCurrency(btcValue)}`],
    ['KEEP Score:', `${report.current_state.keep_score}/100`],
    ['Risk Level:', report.current_state.tier || 'Critical'],
    ['Bitcoin at Risk (BIRS):', `$${formatCurrency(report.current_state.birs)}`],
    ['Assessment Date:', date]
  ];

  metrics.forEach(([label, value]) => {
    doc.text(label, 30, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 120, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
  });

  y += 15;

  // Executive summary text
  if (report.executive?.executive_summary) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Overview', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 8;

    doc.setFontSize(10);
    y = addMultilineText(report.executive.executive_summary, 20, y, 170);
    y += 10;
  }

  // Primary concern
  if (report.executive?.primary_concern) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69);
    doc.text('PRIMARY CONCERN', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 8;

    doc.setFontSize(10);
    y = addMultilineText(report.executive.primary_concern, 20, y, 170);
  }

  // ============ KEEP FRAMEWORK ANALYSIS ============
  doc.addPage();
  pageNum++;
  y = 30;

  doc.setFontSize(20);
  doc.text('KEEP FRAMEWORK ANALYSIS', 20, y);
  y += 15;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  y = addMultilineText(
    'The KEEP Framework evaluates Bitcoin inheritance security across four critical pillars: Key Security, Estate Legal, Emergency Access, and Perpetual Maintenance.',
    20, y, 170
  );
  y += 15;

  // Pillar scores - each gets its own page with structured layout
  const pillars: Array<{
    name: string;
    data?: { score?: number; gaps?: string[]; analysis?: string };
    color: [number, number, number];
  }> = [
    { name: 'KEY SECURITY', data: report.security, color: [255, 99, 132] },
    { name: 'ESTATE LEGAL', data: report.legal, color: [54, 162, 235] },
    { name: 'EMERGENCY ACCESS', data: report.access, color: [255, 206, 86] },
    { name: 'PERPETUAL MAINTENANCE', data: report.maintenance, color: [75, 192, 192] }
  ];

  pillars.forEach((pillar, index) => {
    // Each pillar gets its own page
    doc.addPage();
    pageNum++;
    y = 30;

    // Pillar header with color band
    doc.setFillColor(...pillar.color);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(pillar.name, 20, 10);

    // Score card section
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, 170, 35, 'F');

    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('KEEP Score:', 25, y);
    doc.setFont('helvetica', 'normal');
    const score = pillar.data?.score || 0;
    doc.text(`${score.toFixed(1)} / 10`, 70, y);

    // Risk level indicator
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Risk Level:', 25, y);
    doc.setFont('helvetica', 'normal');
    const riskLevel = score < 3 ? 'Critical' : score < 5 ? 'High' : score < 7 ? 'Moderate' : 'Low';
    const riskColor: [number, number, number] =
      score < 3 ? [220, 53, 69] :
      score < 5 ? [255, 193, 7] :
      score < 7 ? [255, 193, 7] :
      [40, 167, 69];
    doc.setTextColor(...riskColor);
    doc.text(`● ${riskLevel}`, 70, y);
    doc.setTextColor(0, 0, 0);

    // Visual progress bar
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Progress:', 25, y);
    doc.setDrawColor(200, 200, 200);
    doc.rect(70, y - 4, 100, 6);
    doc.setFillColor(...pillar.color);
    doc.rect(70, y - 4, score * 10, 6, 'F');

    y += 20;

    // Critical Risk Points - Complete Findings (no truncation)
    if (pillar.data?.gaps && pillar.data.gaps.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Critical Risk Points Identified', 20, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      // Display all gaps with complete text
      pillar.data.gaps.forEach((gap, idx) => {
        // Check if we need a new page
        if (y > 240) {
          doc.addPage();
          pageNum++;
          y = 30;

          // Re-add header for continuation
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${pillar.name} - Risk Points (Continued)`, 20, y);
          y += 10;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
        }

        // Number and complete text with multi-line support
        doc.setFont('helvetica', 'bold');
        doc.text(`${idx + 1}.`, 25, y);
        doc.setFont('helvetica', 'normal');

        // Split long text into multiple lines
        const gapLines = doc.splitTextToSize(gap, 155);
        gapLines.forEach((line, lineIdx) => {
          doc.text(line, 35, y + (lineIdx * 5));
        });
        y += (gapLines.length * 5) + 7;
      });
    }

    y += 10;

    // Analyst Comment Box
    if (pillar.data?.analysis) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Analyst Comment', 20, y);
      y += 8;

      doc.setFillColor(255, 253, 235);
      doc.setDrawColor(255, 193, 7);
      doc.setLineWidth(0.5);
      doc.rect(20, y, 170, 40, 'FD');
      doc.setLineWidth(0.2);

      y += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const analysisLines = doc.splitTextToSize(pillar.data.analysis, 160);
      // Render each line individually to prevent overlap
      analysisLines.slice(0, 6).forEach((line, idx) => {
        doc.text(line, 25, y + (idx * 5));
      });
      y += (Math.min(analysisLines.length, 6) * 5) + 10;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('KEEP Framework | Bitcoin Inheritance Audit | Confidential', 105, 285, { align: 'center' });
    doc.text(`Page ${pageNum}`, 105, 290, { align: 'center' });
  });

  // ============ ACTION PLAN ============
  doc.addPage();
  pageNum++;
  y = 30;

  doc.setFontSize(20);
  doc.text('PRIORITY ACTION PLAN', 20, y);
  y += 15;

  if (report.actions) {
    const actions = report.actions.priority_actions ||
                   (report.actions.action ? [{ action: report.actions.action, rationale: '', priority: 'Medium' }] : []);

    if (actions.length > 0) {
      actions.forEach((action, index) => {
        if (y > 240) {
          doc.addPage();
          pageNum++;
          y = 30;
        }

        // Priority badge
        const priority = action.priority || 'Medium';
        const priorityColors: Record<string, [number, number, number]> = {
          'High': [220, 53, 69],
          'Medium': [255, 193, 7],
          'Low': [40, 167, 69]
        };
        const color = priorityColors[priority] || [128, 128, 128] as [number, number, number];

        doc.setFillColor(...color);
        doc.rect(20, y, 40, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Priority ${index + 1}`, 40, y + 6, { align: 'center' });

        y += 12;

        // Action
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        y = addMultilineText(action.action, 20, y, 170);
        y += 5;

        // Rationale
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Rationale: ', 20, y);
        y = addMultilineText(action.rationale, 50, y, 140);
        y += 3;

        // Timeline
        if (action.timeline) {
          doc.setFont('helvetica', 'bold');
          doc.text('Timeline: ', 20, y);
          doc.setFont('helvetica', 'normal');
          doc.text(action.timeline, 50, y);
          y += 5;
        }

        y += 10;
      });
    }
  }

  // ============ APPENDIX ============
  doc.addPage();
  pageNum++;
  y = 30;

  doc.setFontSize(20);
  doc.text('APPENDIX', 20, y);
  y += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Methodology', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;

  doc.setFontSize(10);
  y = addMultilineText(
    'This audit was conducted using the KEEP Framework, a comprehensive methodology for evaluating Bitcoin inheritance security. The assessment analyzes current practices, identifies vulnerabilities, and provides actionable recommendations to protect digital assets for beneficiaries.',
    20, y, 170
  );
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Calculation', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;

  doc.setFontSize(10);
  const portfolioValue = report.current_state.holdings || report.current_state.btc_value || 0;
  y = addMultilineText(
    `Bitcoin Inheritance Risk Score (BIRS) represents the dollar value at risk based on your current security posture. With a KEEP Score of ${report.current_state.keep_score}/100 and holdings of $${formatCurrency(portfolioValue)}, approximately $${formatCurrency(report.current_state.birs)} is at risk of being lost to your beneficiaries.`,
    20, y, 170
  );
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Next Steps', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 8;

  doc.setFontSize(10);
  const nextSteps = [
    '1. Review and prioritize the action items identified in this report',
    '2. Implement high-priority security improvements immediately',
    '3. Schedule a follow-up assessment in 6-12 months',
    '4. Consider professional Bitcoin inheritance planning services',
    '5. Regularly test your inheritance procedures with trusted parties'
  ];

  nextSteps.forEach(step => {
    if (y > 270) {
      doc.addPage();
      pageNum++;
      y = 30;
    }
    y = addMultilineText(step, 20, y, 170);
    y += 5;
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This report contains confidential information. Handle with appropriate security measures.', 105, 285, { align: 'center' });
  doc.text(`Page ${pageNum}`, 105, 290, { align: 'center' });

  // Get the PDF as a buffer (for server-side)
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

/**
 * Generate PDF and save to file (for client-side downloads)
 */
export function generateAndSavePDF(report: AuditReport, formData: any): void {
  const doc = new jsPDF();

  // [Same PDF generation code as above, but ending with:]
  const client = report.client || formData.full_name || 'Bitcoin Holder';

  // Save the PDF
  doc.save(`Bitcoin-Inheritance-Audit-${client.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
}