import { NextRequest, NextResponse } from 'next/server';
import { getSubmission, updateSubmission } from '@/lib/submissions';
import { isAdminAuthed } from '@/lib/admin-auth';

const VALID_STATUSES = ['pending', 'approved', 'rejected'] as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ submission });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const patch: { status?: 'pending' | 'approved' | 'rejected'; reviewNote?: string; tags?: string[] } = {};

  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !VALID_STATUSES.includes(body.status as never)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    patch.status = body.status as (typeof VALID_STATUSES)[number];
  }

  if (body.reviewNote !== undefined) {
    if (typeof body.reviewNote !== 'string') {
      return NextResponse.json({ error: 'Invalid reviewNote' }, { status: 400 });
    }
    patch.reviewNote = body.reviewNote.slice(0, 4000);
  }

  if (body.tags !== undefined) {
    if (
      !Array.isArray(body.tags) ||
      body.tags.some((t) => typeof t !== 'string' || !t.trim() || t.length > 40)
    ) {
      return NextResponse.json({ error: 'Invalid tags' }, { status: 400 });
    }
    const seen = new Set<string>();
    patch.tags = (body.tags as string[])
      .map((t) => t.trim())
      .filter((t) => {
        const key = t.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 20);
  }

  const submission = await updateSubmission(id, patch);
  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ submission });
}
