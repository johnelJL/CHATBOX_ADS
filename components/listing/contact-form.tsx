'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToaster } from '@/components/toaster';

export const ContactForm = ({ listingId }: { listingId: string }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToaster();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/contact/${listingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (!response.ok) throw new Error('Failed to send message');
      pushToast({ title: 'Message sent', description: 'The seller will reply via email.' });
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      pushToast({ title: 'Error', description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Name</span>
        <input
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
          value={name}
          required
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Email</span>
        <input
          type="email"
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
          value={email}
          required
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Message</span>
        <textarea
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
          rows={4}
          value={message}
          required
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
};
