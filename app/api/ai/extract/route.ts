import { NextRequest, NextResponse } from 'next/server';

import { CarFieldExtractor } from '@/ai/extractCarFields';
import { aiRateLimit } from '@/lib/rate-limit';

const extractor = new CarFieldExtractor();

export async function POST(req: NextRequest) {
  if (aiRateLimit) {
    const result = await aiRateLimit.limit(req.ip ?? 'anonymous');
    if (!result.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  const body = await req.json();
  const { images = [], partial = {}, conversation = [] } = body;

  try {
    const result = await extractor.infer({ images, partial, conversation });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
