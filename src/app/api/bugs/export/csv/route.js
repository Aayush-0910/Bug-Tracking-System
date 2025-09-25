import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import papaparse from 'papaparse';

export async function GET() {
  const bugs = await prisma.bug.findMany({
    include: {
      developer: true,
    },
  });

  const data = bugs.map(bug => ({
    ID: bug.id,
    Title: bug.title,
    Status: bug.status,
    Priority: bug.priority,
    'Assigned To': bug.developer ? bug.developer.name : 'Unassigned',
    'Created At': bug.createdAt.toISOString(),
  }));

  const csv = papaparse.unparse(data);

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="bugs.csv"',
    },
  });
}
