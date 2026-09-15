import { NextRequest, NextResponse } from 'next/server';
import { getSubmission, listSubmissions } from '@/lib/submissions';
import { isAdminAuthed } from '@/lib/admin-auth';
import { runInstantChecks, runGithubCheck } from '@/lib/checks';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const all = await listSubmissions();
  const githubCheck = await runGithubCheck(submission);
  const checks = [...runInstantChecks(submission, all), githubCheck];

  return NextResponse.json({ checks });
}
