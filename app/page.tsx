import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { LandingHero } from '@/components/landing-hero';
import { MarketingLayout } from '@/components/marketing-layout';

export default function HomePage() {
  return (
    <MarketingLayout>
      <LandingHero />
      <section className="mx-auto mt-16 max-w-5xl rounded-3xl bg-white p-10 shadow-xl">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Sell your car in minutes
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Upload photos, answer a few AI-assisted questions, and publish a polished listing with
          confidence-backed specs and safety checks.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/(dashboard)/create">Create listing</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/(public)/listings">Browse listings</Link>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
