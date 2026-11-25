import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { toPublicUser, updateDb } from '@/lib/db';
import { CATEGORIES, ROLES, type CompetitionCategory, type GoalLevel, type Role } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
      campus?: string;
      faculty?: string;
      batchYear?: number;
      primaryRole?: Role;
      targetCategory?: CompetitionCategory;
      goalLevel?: GoalLevel;
      hoursAvailable?: number;
    };

    const fullName = body.fullName?.trim() || '';
    const email = body.email?.trim().toLowerCase() || '';
    const password = body.password || '';

    if (!fullName || !email || password.length < 6) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan kata sandi (minimal 6 karakter) wajib diisi.' },
        { status: 400 }
      );
    }

    const primaryRole: Role = ROLES.includes(body.primaryRole as Role)
      ? (body.primaryRole as Role)
      : 'Frontend';
    const targetCategory: CompetitionCategory = CATEGORIES.includes(
      body.targetCategory as CompetitionCategory
    )
      ? (body.targetCategory as CompetitionCategory)
      : 'Hackathon';
    const goalLevel: GoalLevel =
      body.goalLevel === 1 || body.goalLevel === 2 || body.goalLevel === 3
        ? body.goalLevel
        : 2;

    const result = await updateDb((db) => {
      if (db.users.some((u) => u.email === email)) {
        return { error: 'Email sudah terdaftar. Silakan masuk.' as const };
      }

      const newUser = {
        id: `usr-${crypto.randomUUID().slice(0, 8)}`,
        fullName,
        email,
        passwordHash: hashPassword(password),
        campus: body.campus?.trim() || 'Institut Teknologi Bandung',
        faculty: body.faculty?.trim() || 'STEI - Teknik Informatika',
        batchYear: Number(body.batchYear) || 2024,
        primaryRole,
        skills: {
          frontend: primaryRole === 'Frontend' ? 4 : 2,
          backend: primaryRole === 'Backend' ? 4 : 2,
          dataAi: primaryRole === 'Data/AI' ? 4 : 2,
          uiUx: primaryRole === 'UI/UX' ? 4 : 2,
          business: primaryRole === 'Business' ? 4 : 2,
        },
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        hoursAvailable: Number(body.hoursAvailable) || 10,
        academicLoad: 18,
        targetCategory,
        goalLevel,
        bio: '',
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      return { user: toPublicUser(newUser) };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    await setSessionCookie(result.user.id);
    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
}
