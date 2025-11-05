import './globals.css';

import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

import { I18nProvider } from '@/components/i18n-provider';
import { QueryProvider } from '@/components/query-provider';
import { Toaster } from '@/components/toaster';

export const metadata: Metadata = {
  title: 'ClassifAI Cars',
  description: 'AI-assisted classifieds for smarter car selling.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="min-h-screen bg-slate-50">
        <NextIntlClientProvider locale="en">
          <I18nProvider>
            <Toaster>
              <QueryProvider>
                <div className="flex min-h-screen flex-col">
                  <main className="flex-1">{children}</main>
                </div>
              </QueryProvider>
            </Toaster>
          </I18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
