import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface RequestBody {
  entrantEmail: string;
  entrantName: string;
  contestTitle: string;
  entryTitle: string;
  contestUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { entrantEmail, entrantName, contestTitle, entryTitle, contestUrl } = body;

    if (!entrantEmail || !entrantName || !contestTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #1e1b4b;">
        <div style="background: linear-gradient(135deg, #ede9fe, #fce7f3); border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 12px;">✨</div>
          <h1 style="color: #7c3aed; font-size: 24px; margin: 0 0 8px;">Your Entry Has Been Approved!</h1>
          <p style="color: #6d28d9; margin: 0; font-size: 15px;">Congratulations, ${entrantName}!</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #374151;">
          Great news — your entry <strong>"${entryTitle}"</strong> has been reviewed and approved for the
          <strong>${contestTitle}</strong> contest on Spotlightly! 🎉
        </p>

        <p style="font-size: 15px; line-height: 1.6; color: #374151;">
          Your entry is now live and visible to the public. The more votes you get, the better your chances of winning!
        </p>

        <div style="background: #fef9c3; border: 1px solid #fde68a; border-radius: 16px; padding: 20px; margin: 24px 0; text-align: center;">
          <p style="font-size: 16px; font-weight: 700; color: #92400e; margin: 0 0 8px;">📣 Share to Get Votes!</p>
          <p style="font-size: 14px; color: #78350f; margin: 0 0 16px;">
            Share your entry with your friends and family to get as many votes as possible.
            Every vote counts toward winning!
          </p>
          <a href="${contestUrl}"
            style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 600; font-size: 15px;">
            View My Entry →
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
          💡 <strong>Tips to get more votes:</strong><br/>
          • Share the link on Instagram, TikTok, WhatsApp, and Facebook<br/>
          • Ask your friends and family to vote for you<br/>
          • Post about it in your community groups<br/>
          • The more you share, the more votes you'll get!
        </p>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 16px; text-align: center;">
          <p style="font-size: 13px; color: #9ca3af; margin: 0;">
            ✨ Spotlightly — Where Creativity Takes Center Stage<br/>
            <span style="color: #d1d5db;">Powered by Kritical Technolabs LLC</span>
          </p>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'Spotlightly <noreply@spotlightly.club>',
      to: [entrantEmail],
      subject: `🎉 Your entry "${entryTitle}" has been approved!`,
      html,
    });

    if (result.error) {
      console.error('Resend error (approval):', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Send approval email error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
