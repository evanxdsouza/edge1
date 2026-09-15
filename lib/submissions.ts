import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export type TimelineEventType = 'created' | 'status_changed' | 'note_updated' | 'tags_updated';

export type TimelineEntry = {
  id: string;
  type: TimelineEventType;
  detail: string;
  at: string;
};

export type Submission = {
  id: string;
  name: string;
  email: string;
  address: string;
  hackatimeLink: string;
  demoLink: string;
  repoLink: string;
  description: string;
  status: SubmissionStatus;
  reviewNote: string;
  tags: string[];
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

export type NewSubmission = Pick<
  Submission,
  'name' | 'email' | 'address' | 'hackatimeLink' | 'demoLink' | 'repoLink' | 'description'
>;

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

// Serializes writes so concurrent requests don't clobber each other's changes.
let writeQueue: Promise<unknown> = Promise.resolve();

function normalize(raw: Partial<Submission>): Submission {
  return {
    id: raw.id!,
    name: raw.name ?? '',
    email: raw.email ?? '',
    address: raw.address ?? '',
    hackatimeLink: raw.hackatimeLink ?? '',
    demoLink: raw.demoLink ?? '',
    repoLink: raw.repoLink ?? '',
    description: raw.description ?? '',
    status: raw.status ?? 'pending',
    reviewNote: raw.reviewNote ?? '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    createdAt: raw.createdAt ?? new Date(0).toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date(0).toISOString(),
  };
}

async function readAll(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Submission>[];
    return parsed.map(normalize);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(submissions: Submission[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf8');
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(fn);
  writeQueue = result.catch(() => {});
  return result;
}

function pushTimeline(
  submission: Submission,
  type: TimelineEventType,
  detail: string,
  at: string
): Submission {
  const entry: TimelineEntry = { id: crypto.randomUUID(), type, detail, at };
  return { ...submission, timeline: [...submission.timeline, entry] };
}

export function listSubmissions(): Promise<Submission[]> {
  return readAll().then((submissions) =>
    [...submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export function getSubmission(id: string): Promise<Submission | null> {
  return readAll().then((submissions) => submissions.find((s) => s.id === id) ?? null);
}

export function createSubmission(input: NewSubmission): Promise<Submission> {
  return enqueue(async () => {
    const submissions = await readAll();
    const now = new Date().toISOString();
    let submission: Submission = {
      id: crypto.randomUUID(),
      ...input,
      status: 'pending',
      reviewNote: '',
      tags: [],
      timeline: [],
      createdAt: now,
      updatedAt: now,
    };
    submission = pushTimeline(submission, 'created', 'Submission received', now);
    submissions.push(submission);
    await writeAll(submissions);
    return submission;
  });
}

export function updateSubmission(
  id: string,
  patch: Partial<Pick<Submission, 'status' | 'reviewNote' | 'tags'>>
): Promise<Submission | null> {
  return enqueue(async () => {
    const submissions = await readAll();
    const index = submissions.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const now = new Date().toISOString();
    let updated: Submission = { ...submissions[index] };

    if (patch.status !== undefined && patch.status !== updated.status) {
      updated = pushTimeline(updated, 'status_changed', `Status set to ${patch.status}`, now);
      updated.status = patch.status;
    }
    if (patch.reviewNote !== undefined && patch.reviewNote !== updated.reviewNote) {
      updated = pushTimeline(
        updated,
        'note_updated',
        patch.reviewNote ? `Note updated: "${patch.reviewNote.slice(0, 120)}"` : 'Note cleared',
        now
      );
      updated.reviewNote = patch.reviewNote;
    }
    if (patch.tags !== undefined) {
      const before = new Set(updated.tags);
      const after = new Set(patch.tags);
      const added = patch.tags.filter((t) => !before.has(t));
      const removed = updated.tags.filter((t) => !after.has(t));
      if (added.length || removed.length) {
        const parts = [
          added.length ? `added ${added.join(', ')}` : null,
          removed.length ? `removed ${removed.join(', ')}` : null,
        ].filter(Boolean);
        updated = pushTimeline(updated, 'tags_updated', `Tags ${parts.join('; ')}`, now);
        updated.tags = patch.tags;
      }
    }

    updated.updatedAt = now;
    submissions[index] = updated;
    await writeAll(submissions);
    return updated;
  });
}

export function getSubmissionsByEmail(email: string, excludeId?: string): Promise<Submission[]> {
  return readAll().then((submissions) =>
    submissions
      .filter((s) => s.email.toLowerCase() === email.toLowerCase() && s.id !== excludeId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}
