import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET() {
  const bugs = await prisma.bug.findMany({
    include: {
      developer: true,
    },
  });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;
  const titleFontSize = 18;
  const margin = 50;

  // Title
  page.drawText('Bug Report', {
    x: margin,
    y: height - margin,
    font,
    size: titleFontSize,
    color: rgb(0, 0, 0),
  });

  // Table Header
  const tableY = height - margin - 40;
  const rowHeight = 20;
  const colWidths = [40, 150, 80, 80, 100, 100];
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Assigned To', 'Created At'];

  headers.forEach((header, i) => {
    page.drawText(header, {
      x: margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
      y: tableY,
      font,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
  });

  // Table Rows
  bugs.forEach((bug, rowIndex) => {
    const y = tableY - (rowIndex + 1) * rowHeight;
    const row = [
      bug.id.toString(),
      bug.title,
      bug.status,
      bug.priority,
      bug.developer ? bug.developer.name : 'Unassigned',
      new Date(bug.createdAt).toLocaleDateString(),
    ];

    row.forEach((cell, i) => {
      page.drawText(cell, {
        x: margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y,
        font,
        size: fontSize,
        color: rgb(0.1, 0.1, 0.1),
      });
    });
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="bugs.pdf"',
    },
  });
}
