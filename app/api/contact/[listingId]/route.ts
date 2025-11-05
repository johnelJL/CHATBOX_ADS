import { NextRequest, NextResponse } from 'next/server';

import { sendContactEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { contactRateLimit } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  if (contactRateLimit) {
    const result = await contactRateLimit.limit(request.ip ?? 'anonymous');
    if (!result.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
    include: { user: true }
  });

  if (!listing?.user?.email) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  const body = await request.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing contact details' }, { status: 400 });
  }

  try {
    await sendContactEmail({
      to: listing.user.email,
      subject: `Enquiry for ${listing.title}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
