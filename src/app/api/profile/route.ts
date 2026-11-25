import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { toPublicUser, updateDb } from '@/lib/db';
import {
  CATEGORIES,
  ROLES,
  type CompetitionCategory,
  type GoalLevel,
  type Role,
  type SkillVector,
} from '@/lib/types';

function clampSkill(val: unknown, fallback: number): number {
  const n = Number(val);
  if (Number.isNaN(n)) return fallback;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<{
      fullName: string;
      campus: string;
      faculty: string;
      batchYear: number;
      primaryRole: Role;
      skills: Partial<SkillVector>;
      githubUrl: string;
      linkedinUrl: string;
      portfolioUrl: string;
      hoursAvailable: number;
      academicLoad: number;
      targetCategory: CompetitionCategory;
      goalLevel: GoalLevel;
      bio: string;
    }>;

    const result = await updateDb((db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) return { error: 'User not found' as const };

      if (body.fullName !== undefined && body.fullName.trim()) {
        user.fullName = body.fullName.trim();
      }
      if (body.campus !== undefined) user.campus = body.campus.trim();
      if (body.faculty !== undefined) user.faculty = body.faculty.trim();
      if (body.batchYear !== undefined) {
        user.batchYear = Math.min(2030, Math.max(2015, Number(body.batchYear) || user.batchYear));
      }
      if (body.primaryRole && ROLES.includes(body.primaryRole)) {
        user.primaryRole = body.primaryRole;
      }
      if (body.skills) {
        user.skills = {
          frontend: clampSkill(body.skills.frontend, user.skills.frontend),
          backend: clampSkill(body.skills.backend, user.skills.backend),
          dataAi: clampSkill(body.skills.dataAi, user.skills.dataAi),
          uiUx: clampSkill(body.skills.uiUx, user.skills.uiUx),
          business: clampSkill(body.skills.business, user.skills.business),
        };
      }
      if (body.githubUrl !== undefined) user.githubUrl = body.githubUrl.trim();
      if (body.linkedinUrl !== undefined) user.linkedinUrl = body.linkedinUrl.trim();
      if (body.portfolioUrl !== undefined) user.portfolioUrl = body.portfolioUrl.trim();
      if (body.hoursAvailable !== undefined) {
        user.hoursAvailable = Math.min(60, Math.max(1, Number(body.hoursAvailable) || 10));
      }
      if (body.academicLoad !== undefined) {
        user.academicLoad = Math.min(26, Math.max(0, Number(body.academicLoad) || 18));
      }
      if (body.targetCategory && CATEGORIES.includes(body.targetCategory)) {
        user.targetCategory = body.targetCategory;
      }
      if (body.goalLevel === 1 || body.goalLevel === 2 || body.goalLevel === 3) {
        user.goalLevel = body.goalLevel;
      }
      if (body.bio !== undefined) user.bio = body.bio.trim();

      // Keep member display info synced on teams
      for (const team of db.teams) {
        for (const m of team.members) {
          if (m.userId === user.id) {
            m.fullName = user.fullName;
            m.faculty = user.faculty;
          }
        }
      }

      return { user: toPublicUser(user) };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
