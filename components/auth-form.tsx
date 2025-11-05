'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export const AuthForm = ({ mode }: { mode: 'login' | 'register' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await signIn('email', { email, redirect: false });
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage('Check your inbox for the sign-in link.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          type="email"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-brand focus:outline-none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending magic link…' : mode === 'login' ? 'Send login link' : 'Create account'}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn('google', { callbackUrl: '/' })}
      >
        Continue with Google
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
};
