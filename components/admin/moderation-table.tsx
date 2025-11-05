'use client';

import useSWR from 'swr';

import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const AdminModerationTable = () => {
  const { data, mutate } = useSWR('/api/listings?status=draft', fetcher);

  const moderate = async (id: string, action: 'approve' | 'flag') => {
    await fetch(`/api/admin/moderate/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    mutate();
  };

  return (
    <div className="space-y-4">
      {(data?.items ?? []).map((listing: any) => (
        <div key={listing.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">{listing.title ?? 'Untitled listing'}</p>
            <p className="text-sm text-slate-600">{listing.moderationFlags?.length ?? 0} flags</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => moderate(listing.id, 'flag')}>
              Flag
            </Button>
            <Button onClick={() => moderate(listing.id, 'approve')}>Approve</Button>
          </div>
        </div>
      ))}
    </div>
  );
};
