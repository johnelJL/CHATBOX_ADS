import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { listingSchema } from '@/lib/validation/listing';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const where: Prisma.ListingWhereInput = {};
  const whereRecord = where as Record<string, unknown>;

  const status = searchParams.get('status');
  const mine = searchParams.get('mine');
  if (!mine) {
    where.status = status ?? 'active';
  }

  const userId = searchParams.get('userId');
  if (userId) {
    where.userId = userId;
  }

  const filters: Record<string, string> = {
    make: 'make',
    model: 'model',
    fuelType: 'fuelType',
    transmission: 'transmission',
    locationRegion: 'locationRegion'
  };

  for (const [param, field] of Object.entries(filters)) {
    const value = searchParams.get(param);
    if (value) {
      whereRecord[field] = value;
    }
  }

  const parseNumber = (value: string | null) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const yearMin = parseNumber(searchParams.get('yearMin'));
  const yearMax = parseNumber(searchParams.get('yearMax'));
  const priceMin = parseNumber(searchParams.get('priceMin'));
  const priceMax = parseNumber(searchParams.get('priceMax'));
  const mileageMax = parseNumber(searchParams.get('mileageMax'));

  if (yearMin !== undefined || yearMax !== undefined) {
    where.year = {
      gte: yearMin,
      lte: yearMax
    };
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    where.price = {
      gte: priceMin,
      lte: priceMax
    };
  }

  if (mileageMax !== undefined) {
    where.mileageKm = { lte: mileageMax };
  }

  const sortParam = searchParams.get('sort') ?? 'newest';
  const orderBy =
    sortParam === 'price-asc'
      ? { price: 'asc' as const }
      : sortParam === 'price-desc'
        ? { price: 'desc' as const }
        : sortParam === 'mileage-asc'
          ? { mileageKm: 'asc' as const }
          : { createdAt: 'desc' as const };

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '12');

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { images: { orderBy: { order: 'asc' } }, moderationFlags: true },
      take: limit,
      skip: (page - 1) * limit,
      orderBy
    }),
    prisma.listing.count({ where })
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const targetUserId = body.userId ?? 'placeholder-user';

  try {
    const validated = listingSchema.parse(body);

    const listing = await prisma.listing.create({
      data: {
        ...validated,
        extras: validated.extras ? validated.extras.join(', ') : undefined,
        userId: targetUserId,
        status: validated.status ?? 'draft'
      }
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid listing payload' }, { status: 400 });
  }
}
