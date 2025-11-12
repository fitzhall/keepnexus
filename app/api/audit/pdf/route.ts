import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/lib/audit/pdf-generator';

// API authentication
const API_KEY = process.env.AUDIT_API_KEY || 'btc-inherit-2024-secure';

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { analysis, formData } = await request.json();

    if (!analysis || !formData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBase64 = await generatePDF(analysis, formData);

    // Return PDF data
    return NextResponse.json({
      pdf: pdfBase64,
      filename: `bitcoin-inheritance-audit-${Date.now()}.pdf`,
      mimeType: 'application/pdf'
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'PDF generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}