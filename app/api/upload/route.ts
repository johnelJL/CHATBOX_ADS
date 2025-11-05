import { NextRequest, NextResponse } from 'next/server';

import { LocalStorageAdapter } from '@/lib/storage';
import { uploadRateLimit } from '@/lib/rate-limit';

const storage = new LocalStorageAdapter();

export const runtime = 'nodejs';

const MAX_SIZE_BYTES = 6 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (uploadRateLimit) {
    const result = await uploadRateLimit.limit(request.ip ?? 'anonymous');
    if (!result.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File missing' }, { status: 400 });
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${Date.now()}-${file.name}`;
  const url = await storage.save(buffer, key, file.type);

  return NextResponse.json({ url, width: 1200, height: 800, blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' });
}
