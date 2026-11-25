import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { readDb, toPublicUser, updateDb } from '@/lib/db';
import { ROLES, type Role } from '@/lib/types';

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const db = await readDb();

  if (teamId) {
    const team = db.teams.find((t) => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: 'Tim tidak ditemukan.' }, { status: 404 });
    }
    if (team.leaderId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const incoming = db.applications
      .filter((a) => a.teamId === teamId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((app) => {
        const applicant = db.users.find((u) => u.id === app.userId);
        return {
          ...app,
          applicant: applicant ? toPublicUser(applicant) : null,
        };
      });
    return NextResponse.json({ applications: incoming });
  }

  const mine = db.applications
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((app) => {
      const team = db.teams.find((t) => t.id === app.teamId);
      return {
        ...app,
        team: team
          ? {
              id: team.id,
              name: team.name,
              competitionName: team.competitionName,
              category: team.category,
              status: team.status,
            }
          : null,
      };
    });

  return NextResponse.json({ applications: mine });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      teamId?: string;
      appliedRole?: Role;
      message?: string;
    };

    const teamId = body.teamId || '';
    const appliedRole = body.appliedRole;
    const message = body.message?.trim() || '';

    if (!teamId || !appliedRole || !ROLES.includes(appliedRole)) {
      return NextResponse.json(
        { error: 'Tim dan role yang dilamar wajib dipilih.' },
        { status: 400 }
      );
    }

    const result = await updateDb((db) => {
      const team = db.teams.find((t) => t.id === teamId);
      if (!team) return { error: 'Tim tidak ditemukan.' as const, code: 404 };
      if (team.status !== 'OPEN') {
        return { error: 'Lobi tim ini sudah ditutup.' as const, code: 400 };
      }
      if (team.members.some((m) => m.userId === userId)) {
        return { error: 'Kamu sudah tergabung di tim ini.' as const, code: 400 };
      }
      if (
        db.applications.some(
          (a) => a.teamId === teamId && a.userId === userId && a.status === 'PENDING'
        )
      ) {
        return { error: 'Lamaran kamu untuk tim ini masih menunggu konfirmasi.' as const, code: 409 };
      }

      const app = {
        id: `app-${crypto.randomUUID().slice(0, 8)}`,
        teamId,
        userId,
        appliedRole,
        message,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
      };
      db.applications.push(app);
      return { application: app };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.code });
    }
    return NextResponse.json({ application: result.application }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
