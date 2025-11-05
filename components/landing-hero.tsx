import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const LandingHero = () => (
  <section className="relative isolate overflow-hidden bg-gradient-to-br from-brand to-slate-900 py-24 text-white">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 text-center">
      <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium uppercase tracking-wide text-white/90">
        AI-powered car classifieds
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
        The fastest way to publish a trustworthy car listing
      </h1>
      <p className="max-w-3xl text-lg text-white/80">
        ClassifAI analyses your car photos, asks the right follow-up questions, and drafts a fully
        compliant ad with pricing guidance and safety checks.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild className="bg-white text-slate-900 hover:bg-white/90">
          <Link href="/(dashboard)/create">Start selling</Link>
        </Button>
        <Button variant="ghost" asChild className="border-white/20 text-white hover:bg-white/10">
          <Link href="/(public)/listings">See live listings</Link>
        </Button>
      </div>
      <div className="mt-16 grid w-full gap-6 rounded-3xl bg-white/10 p-6 backdrop-blur">
        <div className="grid gap-4 sm:grid-cols-3">
          {['Vision analysis', 'Targeted Q&A', 'Publish-ready copy'].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left text-sm text-white/80"
            >
              <h3 className="text-lg font-semibold text-white">{item}</h3>
              <p>
                {item === 'Vision analysis'
                  ? 'Identify make, model, year clues, and even detect number plates to auto-redact.'
                  : item === 'Targeted Q&A'
                    ? 'Ask for missing data like mileage, service history, extras, and pricing.'
                    : 'Generate a concise, honest ad with bullet highlights and safety disclaimers.'}
              </p>
            </div>
          ))}
        </div>
        <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
          <div className="grid h-full grid-cols-4 gap-3 text-left text-xs">
            {[...Array(12).keys()].map((index) => (
              <div
                key={index}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/10 p-3 text-white/70"
              >
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded-full bg-white/20" />
                  <div className="h-2 w-12 rounded-full bg-white/10" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-white/20" />
                  <div className="h-2 w-10 rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-6 top-6 flex items-center justify-between rounded-2xl border border-white/20 bg-slate-900/80 p-4 text-sm shadow-xl">
            <div>
              <p className="font-semibold text-white">Live vision analysis</p>
              <p className="text-white/70">Detect make, model, condition, and redaction zones automatically.</p>
            </div>
            <div className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-slate-900">Real-time</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
