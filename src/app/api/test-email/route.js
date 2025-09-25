import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/mailer';

export async function GET() {
  try {
    const testEmail = process.env.GMAIL_USER;
    if (!testEmail) {
      throw new Error('GMAIL_USER environment variable is not set.');
    }

    await sendNotification({
      to: testEmail,
      subject: 'Test Email from Bug Tracker',
      text: 'This is a test email to verify your SMTP configuration.',
      html: '<p>This is a test email to verify your SMTP configuration.</p>',
    });

    return NextResponse.json({ success: true, message: 'Test email sent successfully to ' + testEmail });
  } catch (error) {
    console.error('Email test failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unknown error occurred.' },
      { status: 500 }
    );
  }
}
