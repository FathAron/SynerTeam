import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { readDb, toPublicUser } from '@/lib/db';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: toPublicUser(user) });
}
