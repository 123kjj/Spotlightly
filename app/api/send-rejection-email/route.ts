import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { REJECTION_REASON_LABELS, RejectionReason } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

interface RequestBody {
  entrantEmail: string;
  entrantName: string;
  contestTitle: string;
  entryTitle: string;
  youtubeUrl: string;
  reason: RejectionReason;
  note?: string;
  creatorEmail?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { entrantEmail, entrantName, contestTitle, entryTitle, youtubeUrl, reason, note, creatorEmail } = body;

    if (!entrantEmail || !youtubeUrl || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reasonLabel = REJECTION_REASON_LABELS[reason] ?? reason;

    const subject = `Your Spotlightly entry for "${contestTitle}" was not approved`;

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 0 auto; color: #1e1b4b;">
        <h2 style="color: #7c3aed;">Entry Update</h2>
        <p>Hi ${entrantName || 'there'},</p>
        <p>
          Your entry "<strong>${entryTitle}</strong>" submitted to the contest
          "<strong>${contestTitle}</strong>" on Spotlightly was <strong>not approved</strong>.
        </p>
        <p style="margin-top: 20px;">
          <strong>Submitted video:</strong><br/>
          <a href="${youtubeUrl}" style="color:#7c3aed;">${youtubeUrl}</a>
        </p>
        <p style="margin-top: 20px;">
          <strong>Reason:</strong><br/>
          ${reasonLabel}
        </p>
        ${note ? `<p style="margin-top: 12px;"><strong>Additional notes from the reviewer:</strong><br/>${note}</p>` : ''}
        <p style="margin-top: 24px; font-size: 13px; color: #7c3aed;">
          If you have questions about this decision, please reply to this email or contact the contest host directly.
        </p>
      </div>
    `;

    const recipients = [entrantEmail];
    const ccList = creatorEmail ? [creatorEmail] : undefined;

    const result = await resend.emails.send({
      from: 'Spotlightly <noreply@spotlightly.club>',
      to: recipients,
      cc: ccList,
      subject,
      html,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (err) {
    console.error('Send rejection email error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
