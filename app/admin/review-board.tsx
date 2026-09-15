'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Submission, SubmissionStatus } from '@/lib/submissions';
import { runInstantChecks } from '@/lib/checks';

const TABS: { key: SubmissionStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function ReviewBoard({ initial }: { initial: Submission[] }) {
  const [submissions, setSubmissions] = useState(initial);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<SubmissionStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const s of submissions) for (const t of s.tags) set.add(t);
    return [...set].sort();
  }, [submissions]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: submissions.length, pending: 0, approved: 0, rejected: 0 };
    for (const s of submissions) c[s.status]++;
    return c;
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter((s) => {
      if (tab !== 'all' && s.status !== tab) return false;
      if (activeTag && !s.tags.includes(activeTag)) return false;
      if (
        q &&
        !(
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.repoLink.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [submissions, tab, activeTag, query]);

  async function updateStatus(id: string, statusUpdate: SubmissionStatus) {
    setBusy(id);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusUpdate, reviewNote: notes[id] }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions((prev) => prev.map((s) => (s.id === id ? data.submission : s)));
      }
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  }

  return (
    <>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="tab-count">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search name, email, repo, description…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Link className="secondary-link" href="/api/submissions/export">
          Export CSV
        </Link>
        <button className="secondary" onClick={logout}>
          Log out
        </button>
      </div>

      {allTags.length > 0 && (
        <div className="tag-filter">
          {allTags.map((t) => (
            <button
              key={t}
              className={`tag-chip ${activeTag === t ? 'active' : ''}`}
              onClick={() => setActiveTag((prev) => (prev === t ? null : t))}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {!filtered.length && <p className="empty">No submissions match.</p>}

      {filtered.map((s) => {
        const checks = runInstantChecks(s, submissions);
        const failing = checks.filter((c) => !c.pass).length;
        return (
          <div className="card" key={s.id}>
            <div className="card-head">
              <h3>
                <Link href={`/admin/${s.id}`}>{s.name}</Link>
              </h3>
              <div className="card-head-badges">
                <span className={`check-badge ${failing ? 'warn' : 'ok'}`}>
                  {failing ? `${failing} check${failing === 1 ? '' : 's'} failing` : 'Checks OK'}
                </span>
                <span className={`status ${s.status}`}>{s.status}</span>
              </div>
            </div>
            {s.tags.length > 0 && (
              <div className="tag-row">
                {s.tags.map((t) => (
                  <span className="tag-chip static" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="meta">
              <div>{s.email}</div>
              <div>{s.address}</div>
              <div>
                <a href={s.hackatimeLink} target="_blank" rel="noreferrer">
                  Hackatime
                </a>
                {' · '}
                <a href={s.repoLink} target="_blank" rel="noreferrer">
                  Repo
                </a>
                {' · '}
                <a href={s.demoLink} target="_blank" rel="noreferrer">
                  Demo
                </a>
              </div>
              <div style={{ marginTop: '0.5rem' }}>{s.description}</div>
              {s.reviewNote && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Note:</strong> {s.reviewNote}
                </div>
              )}
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#888' }}>
                Submitted {new Date(s.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="actions">
              <textarea
                placeholder="Review note (optional)"
                defaultValue={s.reviewNote}
                onChange={(e) => setNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
              />
            </div>
            <div className="actions">
              <button
                className="success"
                disabled={busy === s.id}
                onClick={() => updateStatus(s.id, 'approved')}
              >
                Approve
              </button>
              <button
                className="danger"
                disabled={busy === s.id}
                onClick={() => updateStatus(s.id, 'rejected')}
              >
                Reject
              </button>
              <button
                className="secondary"
                disabled={busy === s.id}
                onClick={() => updateStatus(s.id, 'pending')}
              >
                Reset to pending
              </button>
              <Link className="secondary-link" href={`/admin/${s.id}`}>
                Open detail →
              </Link>
            </div>
          </div>
        );
      })}
    </>
  );
}
