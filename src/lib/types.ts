export type Role = 'Frontend' | 'Backend' | 'Data/AI' | 'UI/UX' | 'Business';

export type CompetitionCategory = 'Hackathon' | 'Data Science' | 'BCC' | 'KTI';

export type GoalLevel = 1 | 2 | 3;

export interface SkillVector {
  frontend: number;
  backend: number;
  dataAi: number;
  uiUx: number;
  business: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  campus: string;
  faculty: string;
  batchYear: number;
  primaryRole: Role;
  skills: SkillVector;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  hoursAvailable: number;
  academicLoad: number;
  targetCategory: CompetitionCategory;
  goalLevel: GoalLevel;
  bio: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export interface TeamMember {
  userId: string;
  fullName: string;
  role: Role;
  faculty: string;
  isLeader: boolean;
}

export interface NeededRole {
  role: Role;
  count: number;
}

export interface Team {
  id: string;
  name: string;
  competitionName: string;
  category: CompetitionCategory;
  description: string;
  goalLevel: GoalLevel;
  requiredHoursPerWeek: number;
  maxMembers: number;
  leaderId: string;
  members: TeamMember[];
  neededRoles: NeededRole[];
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
}

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: string;
  teamId: string;
  userId: string;
  appliedRole: Role;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  teams: Team[];
  applications: Application[];
}

export const ROLES: Role[] = ['Frontend', 'Backend', 'Data/AI', 'UI/UX', 'Business'];

export const CATEGORIES: CompetitionCategory[] = [
  'Hackathon',
  'Data Science',
  'BCC',
  'KTI',
];

export const GOAL_LABELS: Record<GoalLevel, string> = {
  1: 'Eksplorasi / Cari Pengalaman',
  2: 'Target Semifinal / Final',
  3: 'Target Juara / Podium',
};
