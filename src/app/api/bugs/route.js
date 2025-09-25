import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const bugs = await prisma.bug.findMany({
    include: {
      developer: true,
    },
  });
  return NextResponse.json(bugs);
}

export async function POST(request) {
  const data = await request.json();
  const { title, description, priority, developerId, dueDate } = data;
  const newBug = await prisma.bug.create({
    data: {
      title,
      description,
      priority,
      developerId: developerId ? parseInt(developerId, 10) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  return NextResponse.json(newBug, { status: 201 });
}
