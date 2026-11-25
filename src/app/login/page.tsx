'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Aron (Leader - Backend)', email: 'aron@std.itb.ac.id' },
  { label: 'Nadia (Leader - Data/AI)', email: 'nadia@std.itb.ac.id' },
  { label: 'Rafi (UI/UX)', email: 'rafi@std.itb.ac.id' },
  { label: 'Claire (Business)', email: 'claire@std.itb.ac.id' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Gagal masuk.');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Masuk ke SynerTeam</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gunakan email mahasiswa kamu untuk mencari atau membuat tim lomba.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" aria-label="Form masuk">
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
              placeholder="nama@std.itb.ac.id"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="current-password"
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
            <input
              id="current-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              enterKeyHint="done"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Akun Demo Cepat (password: password123)
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
