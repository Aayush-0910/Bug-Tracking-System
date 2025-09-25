import { NextResponse } from 'next/server';

export async function GET() {
  // WARNING: Do not use this in production. This exposes all environment variables.
  // This is for debugging purposes only.
  return NextResponse.json(process.env);
}
