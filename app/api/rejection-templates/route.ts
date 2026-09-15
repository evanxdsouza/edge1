import { NextRequest, NextResponse } from 'next/server';
import { createRejectionTemplate, listRejectionTemplates } from '@/lib/rejection-templates';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const templates = await listRejectionTemplates();
  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = body.name;
  const message = body.message;
  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Missing field: name' }, { status: 400 });
  }
  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Missing field: message' }, { status: 400 });
  }

  const template = await createRejectionTemplate({
    name: name.trim().slice(0, 100),
    message: message.trim().slice(0, 2000),
  });

  return NextResponse.json({ template }, { status: 201 });
}
