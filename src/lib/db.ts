import fs from 'node:fs/promises';
import path from 'node:path';
import { hashPassword } from './auth';
import type { DatabaseSchema, PublicUser, User } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'synerteam.json');

let writeQueue: Promise<unknown> = Promise.resolve();

function createSeedData(): DatabaseSchema {
  const demoPasswordHash = hashPassword('password123');
  const now = new Date().toISOString();

  const users: User[] = [
    {
      id: 'usr-aron',
      fullName: 'Aron Pratama',
      email: 'aron@std.itb.ac.id',
      passwordHash: demoPasswordHash,
      campus: 'Institut Teknologi Bandung',
      faculty: 'STEI - Teknik Informatika',
      batchYear: 2024,
      primaryRole: 'Backend',
      skills: { frontend: 3, backend: 5, dataAi: 3, uiUx: 2, business: 2 },
      githubUrl: 'https://github.com/aronpratama',
      linkedinUrl: 'https://linkedin.com/in/aronpratama',
      portfolioUrl: '',
      hoursAvailable: 14,
      academicLoad: 20,
      targetCategory: 'Hackathon',
      goalLevel: 3,
      bio: 'Fokus di arsitektur backend, REST API, dan database. Siap gas lomba hackathon.',
      createdAt: now,
    },
    {
      id: 'usr-amar',
      fullName: 'Amar Ma’ruf',
      email: 'amar@std.itb.ac.id',
      passwordHash: demoPasswordHash,
      campus: 'Institut Teknologi Bandung',
      faculty: 'STEI - Teknik Informatika',
      batchYear: 2024,
      primaryRole: 'Frontend',
      skills: { frontend: 5, backend: 3, dataAi: 2, uiUx: 4, business: 2 },
      githubUrl: 'https://github.com/amarmaruf',
      linkedinUrl: 'https://linkedin.com/in/amarmaruf',
      portfolioUrl: '',
      hoursAvailable: 12,
      academicLoad: 19,
      targetCategory: 'Hackathon',
      goalLevel: 3,
      bio: 'Next.js & Tailwind enthusiast. Suka bikin UI yang rapi dan responsif.',
      createdAt: now,
    },
    {
      id: 'usr-nadia',
      fullName: 'Nadia Putri',
      email: 'nadia@std.itb.ac.id',
      passwordHash: demoPasswordHash,
      campus: 'Institut Teknologi Bandung',
      faculty: 'FMIPA - Statistika',
      batchYear: 2024,
      primaryRole: 'Data/AI',
      skills: { frontend: 1, backend: 2, dataAi: 5, uiUx: 2, business: 4 },
      githubUrl: 'https://github.com/nadiaputri',
      linkedinUrl: 'https://linkedin.com/in/nadiaputri',
      portfolioUrl: 'https://kaggle.com/nadiaputri',
      hoursAvailable: 15,
      academicLoad: 18,
      targetCategory: 'Data Science',
      goalLevel: 3,
      bio: 'Tertarik di pemodelan prediktif, statistika Bayesian, dan analisis data kompetisi.',
      createdAt: now,
    },
    {
      id: 'usr-rafi',
      fullName: 'Rafi Ramadhan',
      email: 'rafi@std.itb.ac.id',
      passwordHash: demoPasswordHash,
      campus: 'Institut Teknologi Bandung',
      faculty: 'FSRD - Desain Produk',
      batchYear: 2023,
      primaryRole: 'UI/UX',
      skills: { frontend: 2, backend: 1, dataAi: 1, uiUx: 5, business: 4 },
      githubUrl: '',
      linkedinUrl: 'https://linkedin.com/in/rafiramadhan',
      portfolioUrl: 'https://behance.net/rafiramadhan',
      hoursAvailable: 10,
      academicLoad: 18,
      targetCategory: 'Hackathon',
      goalLevel: 2,
      bio: 'Product designer & UX researcher, biasa pakai Figma untuk rapid prototyping.',
      createdAt: now,
    },
    {
      id: 'usr-claire',
      fullName: 'Claire Wijaya',
      email: 'claire@std.itb.ac.id',
      passwordHash: demoPasswordHash,
      campus: 'Institut Teknologi Bandung',
      faculty: 'SBM - Manajemen',
      batchYear: 2024,
      primaryRole: 'Business',
      skills: { frontend: 1, backend: 1, dataAi: 2, uiUx: 3, business: 5 },
      githubUrl: '',
      linkedinUrl: 'https://linkedin.com/in/clairewijaya',
      portfolioUrl: '',
      hoursAvailable: 12,
      academicLoad: 20,
      targetCategory: 'BCC',
      goalLevel: 3,
      bio: 'Berpengalaman di Business Case Competition, financial modeling, dan pitching.',
      createdAt: now,
    },
  ];

  const teams = [
    {
      id: 'team-stack-itb',
      name: 'OceanVibe Builders',
      competitionName: 'STACK 2026 by GDGoC ITB',
      category: 'Hackathon' as const,
      description:
        'Membangun platform solusi kampus cerdas untuk membantu mahasiswa berkolaborasi lebih efektif. Sudah ada Backend dan Frontend, butuh UI/UX untuk desain flow & Business untuk pitching.',
      goalLevel: 3 as const,
      requiredHoursPerWeek: 12,
      maxMembers: 4,
      leaderId: 'usr-aron',
      members: [
        {
          userId: 'usr-aron',
          fullName: 'Aron Pratama',
          role: 'Backend' as const,
          faculty: 'STEI - Teknik Informatika',
          isLeader: true,
        },
        {
          userId: 'usr-amar',
          fullName: 'Amar Ma’ruf',
          role: 'Frontend' as const,
          faculty: 'STEI - Teknik Informatika',
          isLeader: false,
        },
      ],
      neededRoles: [
        { role: 'UI/UX' as const, count: 1 },
        { role: 'Data/AI' as const, count: 1 },
      ],
      status: 'OPEN' as const,
      createdAt: now,
    },
    {
      id: 'team-satria-data',
      name: 'Bayes Squad',
      competitionName: 'Satria Data 2026 - Big Data Challenge',
      category: 'Data Science' as const,
      description:
        'Tim Statistika yang fokus pada pemodelan machine learning dan data storytelling. Mencari rekan yang kuat di engineering pipeline atau visualisasi dashboard.',
      goalLevel: 3 as const,
      requiredHoursPerWeek: 14,
      maxMembers: 3,
      leaderId: 'usr-nadia',
      members: [
        {
          userId: 'usr-nadia',
          fullName: 'Nadia Putri',
          role: 'Data/AI' as const,
          faculty: 'FMIPA - Statistika',
          isLeader: true,
        },
      ],
      neededRoles: [
        { role: 'Backend' as const, count: 1 },
        { role: 'Frontend' as const, count: 1 },
      ],
      status: 'OPEN' as const,
      createdAt: now,
    },
    {
      id: 'team-ganesha-bcc',
      name: 'Ganesha Strategy Lab',
      competitionName: 'Ganesha Business Case Competition',
      category: 'BCC' as const,
      description:
        'Fokus analisis strategi ekspansi pasar dan keberlanjutan bisnis. Butuh anggota yang bisa bantu olah data kuantitatif dan desain deck presentasi.',
      goalLevel: 2 as const,
      requiredHoursPerWeek: 8,
      maxMembers: 3,
      leaderId: 'usr-claire',
      members: [
        {
          userId: 'usr-claire',
          fullName: 'Claire Wijaya',
          role: 'Business' as const,
          faculty: 'SBM - Manajemen',
          isLeader: true,
        },
      ],
      neededRoles: [
        { role: 'Data/AI' as const, count: 1 },
        { role: 'UI/UX' as const, count: 1 },
      ],
      status: 'OPEN' as const,
      createdAt: now,
    },
    {
      id: 'team-gemastik-kti',
      name: 'Karya Inovasi Kampus',
      competitionName: 'GEMASTIK KTI / Karya Tulis Ilmiah',
      category: 'KTI' as const,
      description:
        'Menulis paper ilmiah terapan tentang sistem pemantauan energi gedung kampus. Cocok untuk yang ingin eksplorasi riset dan penulisan ilmiah.',
      goalLevel: 1 as const,
      requiredHoursPerWeek: 6,
      maxMembers: 3,
      leaderId: 'usr-rafi',
      members: [
        {
          userId: 'usr-rafi',
          fullName: 'Rafi Ramadhan',
          role: 'UI/UX' as const,
          faculty: 'FSRD - Desain Produk',
          isLeader: true,
        },
      ],
      neededRoles: [
        { role: 'Data/AI' as const, count: 1 },
        { role: 'Backend' as const, count: 1 },
      ],
      status: 'OPEN' as const,
      createdAt: now,
    },
  ];

  const applications = [
    {
      id: 'app-sample-1',
      teamId: 'team-stack-itb',
      userId: 'usr-rafi',
      appliedRole: 'UI/UX' as const,
      message: 'Halo! Saya biasa desain wireframe & prototype di Figma untuk hackathon.',
      status: 'PENDING' as const,
      createdAt: now,
    },
  ];

  return { users, teams, applications };
}

async function ensureDbFile(): Promise<DatabaseSchema> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    const seeded = createSeedData();
    await fs.writeFile(DB_PATH, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  return ensureDbFile();
}

export async function updateDb<T>(
  mutator: (db: DatabaseSchema) => T | Promise<T>
): Promise<T> {
  const run = writeQueue.then(async () => {
    const db = await ensureDbFile();
    const result = await mutator(db);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return result;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _ignored, ...rest } = user;
  void _ignored;
  return rest;
}
