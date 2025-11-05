import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { action, reason } = body;

  if (!['approve', 'flag'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const listing = await prisma.listing.update({
    where: { id: params.id },
    data: { status: action === 'approve' ? 'active' : 'flagged' }
  });

  if (action === 'flag') {
    await prisma.moderationFlag.create({
      data: {
        listingId: params.id,
        reason: reason ?? 'manual moderation',
        score: 0.8
      }
    });
  }

  return NextResponse.json({ listing });
}
