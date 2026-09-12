'use client';

import { useState } from 'react';
import type { Submission, SubmissionStatus } from '@/lib/submissions';

export default function ReviewBoard({ initial }: { initial: Submission[] }) {
  const [submissions, setSubmissions] = useState(initial);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

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

  if (!submissions.length) {
    return (
      <>
        <p className="empty">No submissions yet.</p>
        <button className="secondary" onClick={logout}>
          Log out
        </button>
      </>
    );
  }

  return (
    <>
      <div className="actions" style={{ marginBottom: '1.5rem' }}>
        <button className="secondary" onClick={logout}>
          Log out
        </button>
      </div>
      {submissions.map((s) => (
        <div className="card" key={s.id}>
          <div className="card-head">
            <h3>{s.name}</h3>
            <span className={`status ${s.status}`}>{s.status}</span>
          </div>
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
          </div>
        </div>
      ))}
    </>
  );
}
