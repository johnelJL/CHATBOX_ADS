import Link from 'next/link';

import { ListingsGrid } from '@/components/listings-grid';
import { MarketingLayout } from '@/components/marketing-layout';

async function getListings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/listings`, {
    next: { revalidate: 30 }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch listings');
  }
  return res.json();
}

export default async function ListingsPage() {
  const { items } = await getListings();

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Cars for sale</h1>
            <p className="text-sm text-slate-600">
              Filter by make, price, mileage, and more. All listings are AI-moderated for safety.
            </p>
          </div>
          <Link href="/(dashboard)/create" className="text-sm font-semibold text-brand">
            Post your car →
          </Link>
        </div>
        <ListingsGrid listings={items} />
      </div>
    </MarketingLayout>
  );
}
