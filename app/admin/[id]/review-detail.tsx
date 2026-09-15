'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Submission, SubmissionStatus } from '@/lib/submissions';
import type { RejectionTemplate } from '@/lib/rejection-templates';
import type { CheckResult } from '@/lib/checks';

type Props = {
  initial: Submission;
  otherByEmail: Submission[];
  allSubmissions: Submission[];
  initialTemplates: RejectionTemplate[];
};

export default function ReviewDetail({ initial, otherByEmail, allSubmissions, initialTemplates }: Props) {
  const router = useRouter();
  const [submission, setSubmission] = useState(initial);
  const [reviewNote, setReviewNote] = useState(initial.reviewNote);
  const [busy, setBusy] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [checks, setChecks] = useState<CheckResult[] | null>(null);
  const [checksForId, setChecksForId] = useState<string | null>(null);
  const checksLoading = checksForId !== submission.id;
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateMessage, setNewTemplateMessage] = useState('');
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/submissions/${submission.id}/checks`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setChecks(data.checks ?? []);
        setChecksForId(submission.id);
      });
    return () => {
      cancelled = true;
    };
  }, [submission.id]);

  const pendingOrder = useMemo(
    () => allSubmissions.filter((s) => s.status === 'pending').map((s) => s.id),
    [allSubmissions]
  );
  const currentPendingIndex = pendingOrder.indexOf(submission.id);
  const prevPendingId =
    currentPendingIndex > 0 ? pendingOrder[currentPendingIndex - 1] : undefined;
  const nextPendingId =
    currentPendingIndex >= 0 && currentPendingIndex < pendingOrder.length - 1
      ? pendingOrder[currentPendingIndex + 1]
      : undefined;

  async function updateStatus(status: SubmissionStatus) {
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNote }),
      });
      const data = await res.json();
      if (res.ok) setSubmission(data.submission);
    } finally {
      setBusy(false);
    }
  }

  async function saveNote() {
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNote }),
      });
      const data = await res.json();
      if (res.ok) setSubmission(data.submission);
    } finally {
      setBusy(false);
    }
  }

  async function saveTags(tags: string[]) {
    const res = await fetch(`/api/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags }),
    });
    const data = await res.json();
    if (res.ok) setSubmission(data.submission);
  }

  function addTag() {
    const value = tagInput.trim();
    if (!value) return;
    if (!submission.tags.includes(value)) {
      saveTags([...submission.tags, value]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    saveTags(submission.tags.filter((t) => t !== tag));
  }

  function applyTemplate(id: string) {
    setSelectedTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (template) setReviewNote(template.message);
  }

  async function createTemplate() {
    if (!newTemplateName.trim() || !newTemplateMessage.trim()) return;
    const res = await fetch('/api/rejection-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTemplateName, message: newTemplateMessage }),
    });
    const data = await res.json();
    if (res.ok) {
      setTemplates((prev) => [...prev, data.template].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTemplateName('');
      setNewTemplateMessage('');
      setShowTemplateForm(false);
    }
  }

  async function deleteTemplate(id: string) {
    const res = await fetch(`/api/rejection-templates/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedTemplateId === id) setSelectedTemplateId('');
    }
  }

  const failingChecks = checks?.filter((c) => !c.pass) ?? [];

  return (
    <>
      <div className="detail-nav">
        <Link href="/admin">← Back to all submissions</Link>
        <div className="detail-nav-buttons">
          <button
            className="secondary"
            disabled={!prevPendingId}
            onClick={() => prevPendingId && router.push(`/admin/${prevPendingId}`)}
          >
            ← Previous pending
          </button>
          <button
            className="secondary"
            disabled={!nextPendingId}
            onClick={() => nextPendingId && router.push(`/admin/${nextPendingId}`)}
          >
            Next pending →
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card-head">
            <h1 style={{ fontSize: '1.3rem', margin: 0 }}>{submission.name}</h1>
            <span className={`status ${submission.status}`}>{submission.status}</span>
          </div>

          <div className="tag-row">
            {submission.tags.map((t) => (
              <span className="tag-chip removable" key={t}>
                {t}
                <button onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`}>
                  ×
                </button>
              </span>
            ))}
            <span className="tag-add">
              <input
                placeholder="Add tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button className="secondary" onClick={addTag}>
                Add
              </button>
            </span>
          </div>

          <div className="meta">
            <div>{submission.email}</div>
            <div>{submission.address}</div>
            <div>
              <a href={submission.hackatimeLink} target="_blank" rel="noreferrer">
                Hackatime
              </a>
              {' · '}
              <a href={submission.repoLink} target="_blank" rel="noreferrer">
                Repo
              </a>
              {' · '}
              <a href={submission.demoLink} target="_blank" rel="noreferrer">
                Demo
              </a>
            </div>
            <div style={{ marginTop: '0.5rem' }}>{submission.description}</div>
            <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#888' }}>
              Submitted {new Date(submission.createdAt).toLocaleString()} · Updated{' '}
              {new Date(submission.updatedAt).toLocaleString()}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Automated checks</h2>
              {checksLoading && <span className="check-badge">Running…</span>}
              {!checksLoading && checks && (
                <span className={`check-badge ${failingChecks.length ? 'warn' : 'ok'}`}>
                  {failingChecks.length ? `${failingChecks.length} failing` : 'All passed'}
                </span>
              )}
            </div>
            <ul className="check-list">
              {(checks ?? []).map((c) => (
                <li key={c.id} className={c.pass ? 'pass' : 'fail'}>
                  <span className="check-icon">{c.pass ? '✓' : '✗'}</span>
                  <div>
                    <div className="check-label">{c.label}</div>
                    <div className="check-summary">{c.summary}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Review note</h2>
            </div>
            <div className="template-row">
              <select
                value={selectedTemplateId}
                onChange={(e) => applyTemplate(e.target.value)}
              >
                <option value="">Apply rejection template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button className="secondary" onClick={() => setShowTemplateForm((v) => !v)}>
                Manage templates
              </button>
            </div>

            {showTemplateForm && (
              <div className="template-manager">
                {templates.map((t) => (
                  <div className="template-item" key={t.id}>
                    <div>
                      <strong>{t.name}</strong>
                      <p>{t.message}</p>
                    </div>
                    <button className="danger" onClick={() => deleteTemplate(t.id)}>
                      Delete
                    </button>
                  </div>
                ))}
                <div className="template-item new">
                  <input
                    placeholder="Template name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                  <textarea
                    placeholder="Feedback message"
                    value={newTemplateMessage}
                    onChange={(e) => setNewTemplateMessage(e.target.value)}
                  />
                  <button className="secondary" onClick={createTemplate}>
                    Save template
                  </button>
                </div>
              </div>
            )}

            <textarea
              className="review-note-textarea"
              placeholder="Review note (visible to whoever reads this record)"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
            <div className="actions">
              <button className="success" disabled={busy} onClick={() => updateStatus('approved')}>
                Approve
              </button>
              <button className="danger" disabled={busy} onClick={() => updateStatus('rejected')}>
                Reject
              </button>
              <button className="secondary" disabled={busy} onClick={() => updateStatus('pending')}>
                Reset to pending
              </button>
              <button className="secondary" disabled={busy} onClick={saveNote}>
                Save note only
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Timeline</h2>
            </div>
            <ul className="timeline">
              {[...submission.timeline].reverse().map((entry) => (
                <li key={entry.id}>
                  <span className="timeline-time">{new Date(entry.at).toLocaleString()}</span>
                  <span className="timeline-detail">{entry.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="detail-side">
          <div className="panel">
            <div className="panel-head">
              <h2>Other submissions by {submission.email}</h2>
            </div>
            {otherByEmail.length === 0 && <p className="empty">No other submissions from this email.</p>}
            <ul className="other-list">
              {otherByEmail.map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/${s.id}`}>{s.name}</Link>
                  <span className={`status ${s.status}`}>{s.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
