import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

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

async function readAll(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw) as Submission[];
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

export function listSubmissions(): Promise<Submission[]> {
  return readAll().then((submissions) =>
    [...submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export function createSubmission(input: NewSubmission): Promise<Submission> {
  return enqueue(async () => {
    const submissions = await readAll();
    const now = new Date().toISOString();
    const submission: Submission = {
      id: crypto.randomUUID(),
      ...input,
      status: 'pending',
      reviewNote: '',
      createdAt: now,
      updatedAt: now,
    };
    submissions.push(submission);
    await writeAll(submissions);
    return submission;
  });
}

export function updateSubmission(
  id: string,
  patch: Partial<Pick<Submission, 'status' | 'reviewNote'>>
): Promise<Submission | null> {
  return enqueue(async () => {
    const submissions = await readAll();
    const index = submissions.findIndex((s) => s.id === id);
    if (index === -1) return null;
    submissions[index] = {
      ...submissions[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await writeAll(submissions);
    return submissions[index];
  });
}
