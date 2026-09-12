import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'edge_admin_session';

function secret(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD environment variable is not set');
  }
  return password;
}

function sign(password: string): string {
  return crypto.createHmac('sha256', password).update('edge-admin').digest('hex');
}

export function checkPassword(candidate: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(password);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function sessionToken(): string {
  return sign(secret());
}

export async function isAdminAuthed(): Promise<boolean> {
  try {
    const store = await cookies();
    const value = store.get(ADMIN_COOKIE)?.value;
    if (!value) return false;
    return value === sessionToken();
  } catch {
    return false;
  }
}
