'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import {
  CATEGORIES,
  GOAL_LABELS,
  ROLES,
  type CompetitionCategory,
  type GoalLevel,
  type NeededRole,
  type PublicUser,
  type Role,
} from '@/lib/types';

export default function CreateTeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [name, setName] = useState('');
  const [competitionName, setCompetitionName] = useState('');
  const [category, setCategory] = useState<CompetitionCategory>('Hackathon');
  const [description, setDescription] = useState('');
  const [goalLevel, setGoalLevel] = useState<GoalLevel>(2);
  const [requiredHoursPerWeek, setRequiredHoursPerWeek] = useState(10);
  const [maxMembers, setMaxMembers] = useState(4);
  const [leaderRole, setLeaderRole] = useState<Role>('Backend');
  const [roleCounts, setRoleCounts] = useState<Record<Role, number>>({
    Frontend: 1,
    Backend: 0,
    'Data/AI': 0,
    'UI/UX': 1,
    Business: 0,
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { user: PublicUser | null }) => {
        setUser(data.user);
        if (data.user) {
          setLeaderRole(data.user.primaryRole);
        }
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const neededRoles: NeededRole[] = ROLES.filter((r) => roleCounts[r] > 0).map((r) => ({
      role: r,
      count: roleCounts[r],
    }));

    if (neededRoles.length === 0) {
      setError('Pilih minimal 1 slot role yang sedang dibutuhkan oleh tim.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          competitionName,
          category,
          description,
          goalLevel,
          requiredHoursPerWeek,
          maxMembers,
          leaderRole,
          neededRoles,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Gagal membuat tim.');
        setSubmitting(false);
        return;
      }
      router.push('/teams');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan.');
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Masuk Diperlukan</h1>
        <p className="mt-2 text-sm text-slate-600">
          Silakan masuk terlebih dahulu untuk membuka lobi tim kompetisi.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Buat Lobi Tim Baru</h1>
        <p className="mt-1 text-sm text-slate-600">
          Buka rekrutmen tim berbasis role agar mahasiswa lain dapat menemukan dan melamar ke
          timmu.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" aria-label="Form buat tim">
          <div>
            <label htmlFor="team-name" className="block text-sm font-medium text-slate-700">
              Nama Tim <span aria-hidden="true">*</span>
            </label>
            <input
              id="team-name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ganesha Innovators"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="competition-name"
                className="block text-sm font-medium text-slate-700"
              >
                Nama Kompetisi <span aria-hidden="true">*</span>
              </label>
              <input
                id="competition-name"
                name="competitionName"
                type="text"
                required
                value={competitionName}
                onChange={(e) => setCompetitionName(e.target.value)}
                placeholder="Contoh: GEMASTIK 2026"
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                Kategori Lomba
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CompetitionCategory)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Deskripsi Tim &amp; Rencana Proyek <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan ide singkat, target lomba, dan ekspektasi kolaborasi..."
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="goalLevel" className="block text-sm font-medium text-slate-700">
                Target Ambisi
              </label>
              <select
                id="goalLevel"
                name="goalLevel"
                value={goalLevel}
                onChange={(e) => setGoalLevel(Number(e.target.value) as GoalLevel)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                {([1, 2, 3] as GoalLevel[]).map((g) => (
                  <option key={g} value={g}>
                    {g} — {GOAL_LABELS[g]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hoursReq" className="block text-sm font-medium text-slate-700">
                Jam Kerja / Minggu
              </label>
              <input
                id="hoursReq"
                name="requiredHoursPerWeek"
                type="number"
                min={2}
                max={50}
                value={requiredHoursPerWeek}
                onChange={(e) => setRequiredHoursPerWeek(Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label htmlFor="maxMembers" className="block text-sm font-medium text-slate-700">
                Kapasitas Maksimal
              </label>
              <input
                id="maxMembers"
                name="maxMembers"
                type="number"
                min={2}
                max={8}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="leaderRole" className="block text-sm font-medium text-slate-700">
              Role Kamu di Tim Ini (Ketua)
            </label>
            <select
              id="leaderRole"
              name="leaderRole"
              value={leaderRole}
              onChange={(e) => setLeaderRole(e.target.value as Role)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:max-w-xs"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-900">
              Kebutuhan Slot Role Anggota
            </legend>
            <p className="mt-0.5 text-xs text-slate-500">
              Tentukan jumlah anggota yang sedang dicari untuk masing-masing role.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ROLES.map((r) => (
                <div
                  key={r}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <label htmlFor={`role-count-${r}`} className="text-sm font-medium text-slate-800">
                    {r}
                  </label>
                  <input
                    id={`role-count-${r}`}
                    type="number"
                    min={0}
                    max={4}
                    value={roleCounts[r]}
                    onChange={(e) =>
                      setRoleCounts((prev) => ({
                        ...prev,
                        [r]: Math.max(0, Math.min(4, Number(e.target.value) || 0)),
                      }))
                    }
                    className="w-16 rounded-md border border-slate-300 px-2 py-1 text-center text-sm"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              {submitting ? 'Membuat Lobi...' : 'Buat Lobi Tim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
