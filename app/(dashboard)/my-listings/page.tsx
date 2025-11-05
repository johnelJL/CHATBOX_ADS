'use client';

import useSWR from 'swr';

import { DashboardShell } from '@/components/dashboard-shell';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MyListingsPage() {
  const { data } = useSWR('/api/listings?mine=1&userId=placeholder-user', fetcher);

  return (
    <DashboardShell title="My listings">
      <div className="space-y-6">
        {(data?.items ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">You have not published any listings yet. Kick things off by creating your first AI-assisted ad.</p>
        ) : null}
        {(data?.items ?? []).map((listing: any) => (
          <div key={listing.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{listing.title}</h2>
              <p className="text-sm text-slate-600">
                {listing.status} • {listing.price} € • {listing.locationRegion}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                Edit
              </button>
              <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                Pause
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
