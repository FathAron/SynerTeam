'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import {
  CATEGORIES,
  GOAL_LABELS,
  ROLES,
  type CompetitionCategory,
  type GoalLevel,
  type Role,
} from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [campus, setCampus] = useState('Institut Teknologi Bandung');
  const [faculty, setFaculty] = useState('');
  const [batchYear, setBatchYear] = useState(2024);
  const [primaryRole, setPrimaryRole] = useState<Role>('Frontend');
  const [targetCategory, setTargetCategory] = useState<CompetitionCategory>('Hackathon');
  const [goalLevel, setGoalLevel] = useState<GoalLevel>(2);
  const [hoursAvailable, setHoursAvailable] = useState(10);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          campus,
          faculty,
          batchYear,
          primaryRole,
          targetCategory,
          goalLevel,
          hoursAvailable,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Pendaftaran gagal.');
        setLoading(false);
        return;
      }
      router.push('/profile');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Daftar Akun Mahasiswa</h1>
        <p className="mt-1 text-sm text-slate-600">
          Buat akun untuk mulai mencari tim atau membuka lobi kompetisi.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" aria-label="Form pendaftaran">
          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-slate-700">
              Nama Lengkap <span aria-hidden="true">*</span>
            </label>
            <input
              id="full-name"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              enterKeyHint="next"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email Mahasiswa <span aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              spellCheck={false}
              enterKeyHint="next"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi@std.itb.ac.id"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-slate-700"
              >
                Kata Sandi <span aria-hidden="true">*</span>
              </label>
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                onClick={() => setShowPassword((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                    Sembunyikan
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    Tampilkan
                  </>
                )}
              </button>
            </div>
            <span id="pw-hint" className="mt-0.5 block text-xs text-slate-500">
              Minimal 6 karakter.
            </span>
            <input
              id="new-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              aria-describedby="pw-hint"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="campus" className="block text-sm font-medium text-slate-700">
                Kampus
              </label>
              <input
                id="campus"
                name="campus"
                type="text"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900"
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
                min={2018}
                max={2030}
                value={batchYear}
                onChange={(e) => setBatchYear(Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="faculty" className="block text-sm font-medium text-slate-700">
              Fakultas / Program Studi <span aria-hidden="true">*</span>
            </label>
            <input
              id="faculty"
              name="faculty"
              type="text"
              required
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="Contoh: STEI - Teknik Informatika / FMIPA - Statistika"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="primaryRole" className="block text-sm font-medium text-slate-700">
                Role Utama <span aria-hidden="true">*</span>
              </label>
              <select
                id="primaryRole"
                name="primaryRole"
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value as Role)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="targetCategory"
                className="block text-sm font-medium text-slate-700"
              >
                Minat Kategori Lomba
              </label>
              <select
                id="targetCategory"
                name="targetCategory"
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value as CompetitionCategory)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="goalLevel" className="block text-sm font-medium text-slate-700">
                Level Ambisi
              </label>
              <select
                id="goalLevel"
                name="goalLevel"
                value={goalLevel}
                onChange={(e) => setGoalLevel(Number(e.target.value) as GoalLevel)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900"
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
                Jam Luang / Minggu
              </label>
              <input
                id="hoursAvailable"
                name="hoursAvailable"
                type="number"
                min={1}
                max={60}
                value={hoursAvailable}
                onChange={(e) => setHoursAvailable(Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {loading ? 'Mendaftarkan...' : 'Buat Akun'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
