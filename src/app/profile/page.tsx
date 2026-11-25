'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import {
  CATEGORIES,
  GOAL_LABELS,
  ROLES,
  type CompetitionCategory,
  type GoalLevel,
  type PublicUser,
  type Role,
  type SkillVector,
} from '@/lib/types';

const SKILL_FIELDS: { key: keyof SkillVector; label: string }[] = [
  { key: 'frontend', label: 'Frontend Development' },
  { key: 'backend', label: 'Backend & API' },
  { key: 'dataAi', label: 'Data Science / AI' },
  { key: 'uiUx', label: 'UI/UX Design' },
  { key: 'business', label: 'Business & Pitching' },
];

export default function ProfilePage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { user: PublicUser | null }) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatusMsg('');
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const data = (await res.json()) as { user?: PublicUser; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error || 'Gagal menyimpan profil.');
      } else {
        setUser(data.user);
        setStatusMsg('Profil berhasil diperbarui.');
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Belum Masuk</h1>
        <p className="mt-2 text-sm text-slate-600">
          Silakan masuk atau daftar terlebih dahulu untuk mengelola profil mahasiswa kamu.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Daftar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Profil Kompetensi Mahasiswa</h1>
            <p className="mt-1 text-sm text-slate-600">
              Data ini ditampilkan kepada ketua tim saat kamu melamar ke sebuah lobi. Privasi
              terjaga: tidak ada data sensitif pribadi.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {user.email}
          </span>
        </div>

        {statusMsg && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {statusMsg}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6" aria-label="Form profil">
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-slate-900">
              Identitas Akademik
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                  Nama Lengkap
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={user.fullName}
                  onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
                />
              </div>
              <div>
                <label htmlFor="campus" className="block text-sm font-medium text-slate-700">
                  Kampus
                </label>
                <input
                  id="campus"
                  name="campus"
                  type="text"
                  value={user.campus}
                  onChange={(e) => setUser({ ...user, campus: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
                />
              </div>
              <div>
                <label htmlFor="faculty" className="block text-sm font-medium text-slate-700">
                  Fakultas / Jurusan
                </label>
                <input
                  id="faculty"
                  name="faculty"
                  type="text"
                  value={user.faculty}
                  onChange={(e) => setUser({ ...user, faculty: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
                />
              </div>
              <div>
                <label htmlFor="batchYear" className="block text-sm font-medium text-slate-700">
                  Angkatan
                </label>
                <input
                  id="batchYear"
                  name="batchYear"
                  type="number"
                  min={2015}
                  max={2030}
                  value={user.batchYear}
                  onChange={(e) => setUser({ ...user, batchYear: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-200 pt-6">
            <legend className="text-base font-semibold text-slate-900">
              Role &amp; Tingkat Keahlian (Skala 1–5)
            </legend>
            <div>
              <label htmlFor="primaryRole" className="block text-sm font-medium text-slate-700">
                Role Utama
              </label>
              <select
                id="primaryRole"
                name="primaryRole"
                value={user.primaryRole}
                onChange={(e) => setUser({ ...user, primaryRole: e.target.value as Role })}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:max-w-xs"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {SKILL_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`skill-${field.key}`}
                      className="text-sm font-medium text-slate-800"
                    >
                      {field.label}
                    </label>
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                      {user.skills[field.key]} / 5
                    </span>
                  </div>
                  <input
                    id={`skill-${field.key}`}
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={user.skills[field.key]}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        skills: { ...user.skills, [field.key]: Number(e.target.value) },
                      })
                    }
                    className="mt-2 w-full accent-indigo-600"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-200 pt-6">
            <legend className="text-base font-semibold text-slate-900">
              Komitmen &amp; Minat Lomba
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="targetCategory"
                  className="block text-sm font-medium text-slate-700"
                >
                  Target Kategori Lomba
                </label>
                <select
                  id="targetCategory"
                  name="targetCategory"
                  value={user.targetCategory}
                  onChange={(e) =>
                    setUser({ ...user, targetCategory: e.target.value as CompetitionCategory })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="goalLevel" className="block text-sm font-medium text-slate-700">
                  Tingkat Ambisi
                </label>
                <select
                  id="goalLevel"
                  name="goalLevel"
                  value={user.goalLevel}
                  onChange={(e) =>
                    setUser({ ...user, goalLevel: Number(e.target.value) as GoalLevel })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base"
                >
                  {([1, 2, 3] as GoalLevel[]).map((g) => (
                    <option key={g} value={g}>
                      {g} — {GOAL_LABELS[g]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="hoursAvailable"
                  className="block text-sm font-medium text-slate-700"
                >
                  Jam Luang per Minggu
                </label>
                <input
                  id="hoursAvailable"
                  name="hoursAvailable"
                  type="number"
                  min={1}
                  max={60}
                  value={user.hoursAvailable}
                  onChange={(e) => setUser({ ...user, hoursAvailable: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
                />
              </div>
              <div>
                <label
                  htmlFor="academicLoad"
                  className="block text-sm font-medium text-slate-700"
                >
                  Beban Studi (SKS Semester Ini)
                </label>
                <input
                  id="academicLoad"
                  name="academicLoad"
                  type="number"
                  min={0}
                  max={26}
                  value={user.academicLoad}
                  onChange={(e) => setUser({ ...user, academicLoad: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-200 pt-6">
            <legend className="text-base font-semibold text-slate-900">
              Portofolio &amp; Bio Singkat
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-slate-700">
                  GitHub URL
                </label>
                <input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  spellCheck={false}
                  value={user.githubUrl}
                  onChange={(e) => setUser({ ...user, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="linkedinUrl"
                  className="block text-sm font-medium text-slate-700"
                >
                  LinkedIn URL
                </label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  spellCheck={false}
                  value={user.linkedinUrl}
                  onChange={(e) => setUser({ ...user, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="portfolioUrl"
                  className="block text-sm font-medium text-slate-700"
                >
                  Kaggle / Behance / Web
                </label>
                <input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  spellCheck={false}
                  value={user.portfolioUrl}
                  onChange={(e) => setUser({ ...user, portfolioUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
                Bio &amp; Pengalaman Lomba
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={user.bio}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
                placeholder="Ceritakan singkat minat atau pengalaman proyek/lombamu..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
              />
            </div>
          </fieldset>

          <div className="flex justify-end border-t border-slate-200 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
