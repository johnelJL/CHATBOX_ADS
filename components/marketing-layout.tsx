import Link from 'next/link';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

export const MarketingLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <header className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-brand">
          ClassifAI Cars
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link href="/(public)/listings" className="hover:text-brand">
            Browse
          </Link>
          <Link href="/pricing" className="hover:text-brand">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-brand">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/api/auth/signin">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/(dashboard)/create">Post your car</Link>
          </Button>
        </div>
      </div>
    </header>
    {children}
    <footer className="mt-24 bg-slate-900 py-12 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-white/70">
        <p>&copy; {new Date().getFullYear()} ClassifAI. Crafted in Athens.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  </div>
);
