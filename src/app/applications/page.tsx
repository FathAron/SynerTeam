'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CategoryBadge, RoleBadge } from '@/components/RoleBadge';
import type { Application, CompetitionCategory, PublicUser } from '@/lib/types';

interface MyApplicationItem extends Application {
  team: {
    id: string;
    name: string;
    competitionName: string;
    category: CompetitionCategory;
    status: 'OPEN' | 'CLOSED';
  } | null;
}

export default function ApplicationsPage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [apps, setApps] = useState<MyApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const meRes = await fetch('/api/auth/me');
      const meData = (await meRes.json()) as { user: PublicUser | null };
      if (!active) return;
      setUser(meData.user);
      if (!meData.user) {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/applications');
      if (res.ok && active) {
        const data = (await res.json()) as { applications: MyApplicationItem[] };
        setApps(data.applications || []);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleWithdraw(id: string) {
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setApps((prev) => prev.filter((a) => a.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Masuk Diperlukan</h1>
        <p className="mt-2 text-sm text-slate-600">
          Silakan masuk untuk melihat riwayat lamaran timmu.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Lamaran Saya</h1>
      <p className="mt-1 text-sm text-slate-600">
        Pantau status pengajuan bergabungmu ke lobi tim kompetisi.
      </p>

      {apps.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-800">
            Kamu belum melamar ke tim mana pun.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Cari Tim di Dashboard
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {apps.map((app) => (
            <li
              key={app.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {app.team && <CategoryBadge category={app.team.category} />}
                  <RoleBadge role={app.appliedRole} />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      app.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : app.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {app.status === 'PENDING'
                      ? 'Menunggu Konfirmasi'
                      : app.status === 'ACCEPTED'
                        ? 'Diterima'
                        : 'Ditolak'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {app.team?.name || 'Tim tidak tersedia'}
                </h2>
                {app.team && (
                  <p className="text-sm text-indigo-700">{app.team.competitionName}</p>
                )}
                {app.message && (
                  <p className="text-sm text-slate-600">Pesan: &ldquo;{app.message}&rdquo;</p>
                )}
              </div>

              {app.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => handleWithdraw(app.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Batalkan
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
