import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// The site owner's inbox — where contact form notifications are sent.
const OWNER_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL || 'kritijain.1019@gmail.com';

interface RequestBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 0 auto; color: #1e1b4b;">
        <h2 style="color: #7c3aed;">New Contact Form Submission</h2>
        <p style="margin-top: 16px;"><strong>From:</strong> ${name} (${email})</p>
        <p style="margin-top: 8px;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin-top: 16px;"><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background: #f5f3ff; padding: 12px; border-radius: 8px;">${message}</p>
        <p style="margin-top: 24px; font-size: 13px; color: #7c3aed;">
          Reply directly to this email to respond to ${name}.
        </p>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'Spotlightly <noreply@spotlightly.club>',
      to: [OWNER_EMAIL],
      replyTo: email,
      subject: `[Spotlightly Contact] ${subject}`,
      html,
    });

    if (result.error) {
      console.error('Resend error (contact form):', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (err) {
    console.error('Send contact email error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
