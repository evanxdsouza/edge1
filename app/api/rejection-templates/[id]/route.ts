import { NextRequest, NextResponse } from 'next/server';
import { deleteRejectionTemplate, updateRejectionTemplate } from '@/lib/rejection-templates';
import { isAdminAuthed } from '@/lib/admin-auth';

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

  const patch: { name?: string; message?: string } = {};
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    patch.name = body.name.trim().slice(0, 100);
  }
  if (body.message !== undefined) {
    if (typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }
    patch.message = body.message.trim().slice(0, 2000);
  }

  const template = await updateRejectionTemplate(id, patch);
  if (!template) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ template });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteRejectionTemplate(id);
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
