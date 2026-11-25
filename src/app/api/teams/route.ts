import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { readDb, updateDb } from '@/lib/db';
import {
  CATEGORIES,
  ROLES,
  type CompetitionCategory,
  type GoalLevel,
  type NeededRole,
  type Role,
} from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const category = searchParams.get('category') || 'ALL';
  const role = searchParams.get('role') || 'ALL';
  const goalLevel = searchParams.get('goalLevel') || 'ALL';
  const mine = searchParams.get('mine') === 'true';

  const userId = await getSessionUserId();
  const db = await readDb();

  let teams = [...db.teams];

  if (mine) {
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    teams = teams.filter(
      (t) => t.leaderId === userId || t.members.some((m) => m.userId === userId)
    );
  } else {
    // Public / Dashboard listing shows open teams first
    if (category !== 'ALL') {
      teams = teams.filter((t) => t.category === category);
    }
    if (role !== 'ALL') {
      teams = teams.filter((t) =>
        t.neededRoles.some((nr) => nr.role === role && nr.count > 0)
      );
    }
    if (goalLevel !== 'ALL') {
      const g = Number(goalLevel);
      teams = teams.filter((t) => t.goalLevel === g);
    }
    if (q) {
      teams = teams.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.competitionName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
  }

  // Sort newest first (NO recommendation scoring!)
  teams.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({ teams });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      competitionName?: string;
      category?: CompetitionCategory;
      description?: string;
      goalLevel?: GoalLevel;
      requiredHoursPerWeek?: number;
      maxMembers?: number;
      leaderRole?: Role;
      neededRoles?: NeededRole[];
    };

    const name = body.name?.trim() || '';
    const competitionName = body.competitionName?.trim() || '';
    const description = body.description?.trim() || '';

    if (!name || !competitionName || !description) {
      return NextResponse.json(
        { error: 'Nama tim, nama lomba, dan deskripsi wajib diisi.' },
        { status: 400 }
      );
    }

    const category: CompetitionCategory = CATEGORIES.includes(
      body.category as CompetitionCategory
    )
      ? (body.category as CompetitionCategory)
      : 'Hackathon';

    const goalLevel: GoalLevel =
      body.goalLevel === 1 || body.goalLevel === 2 || body.goalLevel === 3
        ? body.goalLevel
        : 2;

    const neededRoles: NeededRole[] = (body.neededRoles || [])
      .filter((nr) => ROLES.includes(nr.role) && Number(nr.count) > 0)
      .map((nr) => ({ role: nr.role, count: Math.min(4, Math.max(1, Number(nr.count))) }));

    if (neededRoles.length === 0) {
      return NextResponse.json(
        { error: 'Pilih minimal satu role yang sedang dibutuhkan tim.' },
        { status: 400 }
      );
    }

    const result = await updateDb((db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) return { error: 'User tidak ditemukan.' as const };

      const leaderRole: Role = ROLES.includes(body.leaderRole as Role)
        ? (body.leaderRole as Role)
        : user.primaryRole;

      const newTeam = {
        id: `team-${crypto.randomUUID().slice(0, 8)}`,
        name,
        competitionName,
        category,
        description,
        goalLevel,
        requiredHoursPerWeek: Math.min(50, Math.max(2, Number(body.requiredHoursPerWeek) || 10)),
        maxMembers: Math.min(8, Math.max(2, Number(body.maxMembers) || 4)),
        leaderId: user.id,
        members: [
          {
            userId: user.id,
            fullName: user.fullName,
            role: leaderRole,
            faculty: user.faculty,
            isLeader: true,
          },
        ],
        neededRoles,
        status: 'OPEN' as const,
        createdAt: new Date().toISOString(),
      };

      db.teams.push(newTeam);
      return { team: newTeam };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ team: result.team }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
