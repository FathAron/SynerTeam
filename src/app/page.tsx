import Link from 'next/link';
import { ArrowRight, Compass, PlusCircle, ShieldCheck, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            STACK 2026 — Smarter Campus &amp; Learning
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Temukan Tim Kompetisi Kampus yang Tepat, Tanpa Broadcast Chat yang Tenggelam.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            SynerTeam membantu mahasiswa dalam satu kampus membentuk tim kompetisi
            (Hackathon, Data Science, Business Case, KTI) melalui sistem{' '}
            <strong className="font-semibold text-slate-800">Role-Based Open Lobby</strong>.
            Buat profil keahlianmu, jelajahi lobi tim yang sedang mencari role tertentu,
            atau buka lobi timmu sendiri.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              Jelajahi Lobi Tim
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/teams/new"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Buat Tim Baru
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Daftar Akun Mahasiswa
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            1. Profil Kompetensi &amp; Komitmen
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Lengkapi role utama, tingkat keahlian, jam luang mingguan, target ambisi lomba,
            serta tautan GitHub/LinkedIn tanpa data pribadi yang berlebihan.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            2. Dashboard Pencarian Tim
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Cari dan filter lobi tim berdasarkan kategori lomba, role yang dibutuhkan, dan
            tingkat ambisi, lalu ajukan lamaran langsung ke role yang kosong.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            3. Buka Lobi &amp; Kelola Pelamar
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Buat lobi tim dengan kebutuhan role yang jelas, tinjau mahasiswa yang melamar
            ke timmu, dan terima atau tolak lamaran dalam satu halaman.
          </p>
        </div>
      </section>
    </div>
  );
}
