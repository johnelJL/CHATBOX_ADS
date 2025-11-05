import Image from 'next/image';

import { ContactForm } from '@/components/listing/contact-form';
import { SpecsTable } from '@/components/listing/specs-table';
import { MarketingLayout } from '@/components/marketing-layout';

async function getListing(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/listings/${id}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) {
    throw new Error('Listing not found');
  }
  return res.json();
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const { listing } = await getListing(params.id);

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {(listing.images ?? []).map((image: any) => (
                <div key={image.id ?? image.url} className="relative h-64 overflow-hidden rounded-3xl">
                  <Image src={image.url} alt={listing.title} fill className="object-cover" />
                </div>
              ))}
            </div>
            <article className="prose max-w-none prose-slate">
              <h1>{listing.title}</h1>
              <p className="lead text-brand">{Number(listing.price).toLocaleString()} €</p>
              <p>{listing.description}</p>
            </article>
            <SpecsTable listing={listing} />
          </div>
          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Contact seller</h2>
              <p className="text-sm text-slate-600">
                Messages are relayed privately to protect your email. Avoid upfront payments and meet
                in safe locations.
              </p>
            </div>
            <ContactForm listingId={listing.id} />
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <h3 className="font-semibold text-slate-900">Safety tips</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Inspect the car in daylight and bring a trusted mechanic.</li>
                <li>Verify service history and VIN before transferring funds.</li>
                <li>Use secure payments and avoid sharing unnecessary personal data.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </MarketingLayout>
  );
}
