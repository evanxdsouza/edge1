import { NextRequest, NextResponse } from 'next/server';
import { createSubmission, listSubmissions } from '@/lib/submissions';
import { isAdminAuthed } from '@/lib/admin-auth';

const REQUIRED_FIELDS = [
  'name',
  'email',
  'address',
  'hackatimeLink',
  'demoLink',
  'repoLink',
  'description',
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const submissions = await listSubmissions();
  return NextResponse.json({ submissions });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const values: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    const raw = body[field];
    if (typeof raw !== 'string' || !raw.trim()) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
    values[field] = raw.trim().slice(0, 4000);
  }

  if (!EMAIL_RE.test(values.email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const submission = await createSubmission({
    name: values.name,
    email: values.email,
    address: values.address,
    hackatimeLink: values.hackatimeLink,
    demoLink: values.demoLink,
    repoLink: values.repoLink,
    description: values.description,
  });

  return NextResponse.json({ submission }, { status: 201 });
}
