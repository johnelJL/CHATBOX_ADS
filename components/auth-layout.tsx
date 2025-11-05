import Link from 'next/link';
import { ReactNode } from 'react';

export const AuthLayout = ({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <Link href="/" className="text-sm font-semibold text-brand">
        ← Back to home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  </div>
);
