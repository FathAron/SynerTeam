import { NextResponse } from 'next/server';
import { setSessionCookie, verifyPassword } from '@/lib/auth';
import { readDb, toPublicUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() || '';
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const db = await readDb();
    const user = db.users.find((u) => u.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah.' },
        { status: 401 }
      );
    }

    await setSessionCookie(user.id);
    return NextResponse.json({ user: toPublicUser(user) });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
