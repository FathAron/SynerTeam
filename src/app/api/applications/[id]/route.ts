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
  const body = (await request.json()) as { status?: 'ACCEPTED' | 'REJECTED' };

  if (body.status !== 'ACCEPTED' && body.status !== 'REJECTED') {
    return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
  }
  const nextStatus: 'ACCEPTED' | 'REJECTED' = body.status;

  const result = await updateDb((db) => {
    const app = db.applications.find((a) => a.id === id);
    if (!app) return { error: 'Lamaran tidak ditemukan.' as const, code: 404 };

    const team = db.teams.find((t) => t.id === app.teamId);
    if (!team) return { error: 'Tim tidak ditemukan.' as const, code: 404 };
    if (team.leaderId !== userId) {
      return { error: 'Hanya ketua tim yang dapat memproses lamaran.' as const, code: 403 };
    }
    if (app.status !== 'PENDING') {
      return { error: 'Lamaran sudah diproses sebelumnya.' as const, code: 400 };
    }

    if (nextStatus === 'ACCEPTED') {
      if (team.members.length >= team.maxMembers) {
        return { error: 'Kapasitas tim sudah penuh.' as const, code: 400 };
      }
      const applicant = db.users.find((u) => u.id === app.userId);
      if (!applicant) {
        return { error: 'Pelamar tidak ditemukan.' as const, code: 404 };
      }
      if (!team.members.some((m) => m.userId === applicant.id)) {
        team.members.push({
          userId: applicant.id,
          fullName: applicant.fullName,
          role: app.appliedRole,
          faculty: applicant.faculty,
          isLeader: false,
        });
      }
      // Decrement needed role count
      const roleEntry = team.neededRoles.find((r) => r.role === app.appliedRole);
      if (roleEntry) {
        roleEntry.count -= 1;
        if (roleEntry.count <= 0) {
          team.neededRoles = team.neededRoles.filter((r) => r.role !== app.appliedRole);
        }
      }
      if (team.members.length >= team.maxMembers) {
        team.status = 'CLOSED';
      }
    }

    app.status = nextStatus;
    return { application: app, team };
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.code });
  }
  return NextResponse.json(result);
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
    const idx = db.applications.findIndex((a) => a.id === id);
    if (idx === -1) return { error: 'Lamaran tidak ditemukan.' as const, code: 404 };
    if (db.applications[idx].userId !== userId) {
      return { error: 'Forbidden' as const, code: 403 };
    }
    if (db.applications[idx].status !== 'PENDING') {
      return { error: 'Hanya lamaran yang masih menunggu yang bisa dibatalkan.' as const, code: 400 };
    }
    db.applications.splice(idx, 1);
    return { ok: true };
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.code });
  }
  return NextResponse.json({ ok: true });
}
