import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const developers = await prisma.developer.findMany();
  return NextResponse.json(developers);
}

export async function POST(request) {
  const data = await request.json();
  const { name, email } = data;
  const newDeveloper = await prisma.developer.create({
    data: {
      name,
      email,
    },
  });
  return NextResponse.json(newDeveloper, { status: 201 });
}
