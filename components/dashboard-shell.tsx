'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n-provider';

export const DashboardShell = ({ title, children }: { title: string; children: ReactNode }) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-brand">
            ClassifAI Cars
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/(dashboard)/my-listings" className="hover:text-brand">
              {t('nav.myListings')}
            </Link>
            <Link href="/(dashboard)/create" className="hover:text-brand">
              {t('nav.create')}
            </Link>
          </nav>
          <Button variant="ghost">{t('nav.signOut')}</Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <div className="mt-6 rounded-3xl bg-white p-8 shadow-xl">{children}</div>
      </main>
    </div>
  );
};
