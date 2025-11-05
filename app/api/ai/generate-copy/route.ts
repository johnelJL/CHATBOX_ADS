import { NextRequest, NextResponse } from 'next/server';

import { AdCopyGenerator } from '@/ai/generateAdCopy';
import { aiRateLimit } from '@/lib/rate-limit';
import { listingSchema } from '@/lib/validation/listing';

const generator = new AdCopyGenerator();

export async function POST(req: NextRequest) {
  if (aiRateLimit) {
    const result = await aiRateLimit.limit(req.ip ?? 'anonymous');
    if (!result.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  const body = await req.json();
  const parsed = listingSchema.partial().parse(body.listing ?? {});

  try {
    const result = await generator.generate({ listing: parsed });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Copy generation failed' }, { status: 500 });
  }
}
