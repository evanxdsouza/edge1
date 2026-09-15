import { NextResponse } from 'next/server';
import { listSubmissions } from '@/lib/submissions';
import { isAdminAuthed } from '@/lib/admin-auth';

const COLUMNS = [
  'id',
  'name',
  'email',
  'address',
  'hackatimeLink',
  'demoLink',
  'repoLink',
  'description',
  'status',
  'reviewNote',
  'tags',
  'createdAt',
  'updatedAt',
] as const;

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const submissions = await listSubmissions();
  const rows = [
    COLUMNS.join(','),
    ...submissions.map((s) =>
      COLUMNS.map((col) => {
        const value = col === 'tags' ? s.tags.join('; ') : s[col];
        return csvCell(String(value ?? ''));
      }).join(',')
    ),
  ];

  return new NextResponse(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="submissions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
