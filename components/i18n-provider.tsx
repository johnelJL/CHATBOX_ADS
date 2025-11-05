'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type Locale = 'en' | 'el';

interface I18nContextValue {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}

const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    'create.cta': 'Create listing',
    'nav.myListings': 'My listings',
    'nav.create': 'Create listing',
    'nav.signOut': 'Sign out'
  },
  el: {
    'create.cta': 'Δημιούργησε αγγελία',
    'nav.myListings': 'Οι αγγελίες μου',
    'nav.create': 'Νέα αγγελία',
    'nav.signOut': 'Αποσύνδεση'
  }
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => STRINGS[locale][key] ?? key
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};
