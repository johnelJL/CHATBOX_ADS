import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { listingSchema } from '@/lib/validation/listing';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: 'asc' } }, user: true }
  });

  if (!listing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = listingSchema.partial().parse(body);

  const listing = await prisma.listing.update({
    where: { id: params.id },
    data: {
      ...validated,
      extras: validated.extras ? validated.extras.join(', ') : undefined
    }
  });

  return NextResponse.json({ listing });
}
