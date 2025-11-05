import Image from 'next/image';
import Link from 'next/link';

interface ListingGridItem {
  id: string;
  title: string;
  price: number;
  mileageKm: number;
  year: number;
  locationRegion: string;
  images: { url: string }[];
}

export const ListingsGrid = ({ listings }: { listings: ListingGridItem[] }) => (
  <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {listings.map((listing) => (
      <Link
        href={`/listing/${listing.id}`}
        key={listing.id}
        className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="relative h-52 w-full overflow-hidden">
          {listing.images?.[0]?.url ? (
            <Image
              src={listing.images[0].url}
              alt={listing.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-medium text-slate-600">
              Photo coming soon
            </div>
          )}
        </div>
        <div className="space-y-2 px-5 py-4">
          <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">{listing.title}</h2>
          <p className="text-sm text-brand">{listing.price.toLocaleString()} €</p>
          <p className="text-xs text-slate-500">
            {listing.year} • {listing.mileageKm.toLocaleString()} km • {listing.locationRegion}
          </p>
        </div>
      </Link>
    ))}
  </div>
);
