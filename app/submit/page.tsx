'use client';

import { useState, FormEvent } from 'react';
import '../backend.css';

const FIELDS = [
  { key: 'name', label: 'Full name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'address', label: 'Mailing address (for the Raspberry Pi)', type: 'text' },
  { key: 'hackatimeLink', label: 'Hackatime project link', type: 'url' },
  { key: 'repoLink', label: 'GitHub repo link', type: 'url' },
  { key: 'demoLink', label: 'Live demo link', type: 'url' },
] as const;

type FormState = Record<(typeof FIELDS)[number]['key'] | 'description', string>;

const EMPTY: FormState = {
  name: '',
  email: '',
  address: '',
  hackatimeLink: '',
  repoLink: '',
  demoLink: '',
  description: '',
};

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  function update(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setStatus('sent');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'sent') {
    return (
      <div className="bk">
        <div className="bk-wrap">
          <h1>Submission received</h1>
          <p className="msg ok">Thanks — we&apos;ll review your project soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bk">
      <div className="bk-wrap">
        <h1>Submit your project</h1>
        <form onSubmit={onSubmit}>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label htmlFor={f.key}>{f.label}</label>
              <input
                id={f.key}
                type={f.type}
                required
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
              />
            </div>
          ))}
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            required
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Submitting…' : 'Submit'}
          </button>
          {status === 'error' && <p className="msg error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
