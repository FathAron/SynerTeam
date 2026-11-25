import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { updateDb } from '@/lib/db';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: 'OPEN' | 'CLOSED' };

  const result = await updateDb((db) => {
    const team = db.teams.find((t) => t.id === id);
    if (!team) return { error: 'Tim tidak ditemukan.' as const, code: 404 };
    if (team.leaderId !== userId) {
      return { error: 'Hanya ketua tim yang dapat mengubah status lobi.' as const, code: 403 };
    }
    if (body.status === 'OPEN' || body.status === 'CLOSED') {
      team.status = body.status;
    }
    return { team };
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.code });
  }
  return NextResponse.json({ team: result.team });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await updateDb((db) => {
    const idx = db.teams.findIndex((t) => t.id === id);
    if (idx === -1) return { error: 'Tim tidak ditemukan.' as const, code: 404 };
    if (db.teams[idx].leaderId !== userId) {
      return { error: 'Hanya ketua tim yang dapat menghapus tim.' as const, code: 403 };
    }
    db.teams.splice(idx, 1);
    db.applications = db.applications.filter((a) => a.teamId !== id);
    return { ok: true };
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.code });
  }
  return NextResponse.json({ ok: true });
}
