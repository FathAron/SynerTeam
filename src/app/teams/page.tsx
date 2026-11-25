'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, Crown, ExternalLink, PlusCircle, X } from 'lucide-react';
import { CategoryBadge, GoalBadge, RoleBadge } from '@/components/RoleBadge';
import type { Application, PublicUser, Team } from '@/lib/types';

interface IncomingApplication extends Application {
  applicant: PublicUser | null;
}

export default function MyTeamsPage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [incomingByTeam, setIncomingByTeam] = useState<Record<string, IncomingApplication[]>>({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  async function loadAll() {
    const meRes = await fetch('/api/auth/me');
    const meData = (await meRes.json()) as { user: PublicUser | null };
    setUser(meData.user);

    if (!meData.user) {
      setLoading(false);
      return;
    }

    const teamsRes = await fetch('/api/teams?mine=true');
    const teamsData = (await teamsRes.json()) as { teams: Team[] };
    const myTeams = teamsData.teams || [];
    setTeams(myTeams);

    const ledTeams = myTeams.filter((t) => t.leaderId === meData.user!.id);
    const entries = await Promise.all(
      ledTeams.map(async (t) => {
        const res = await fetch(`/api/applications?teamId=${t.id}`);
        if (!res.ok) return [t.id, []] as const;
        const data = (await res.json()) as { applications: IncomingApplication[] };
        return [t.id, data.applications || []] as const;
      })
    );
    setIncomingByTeam(Object.fromEntries(entries));
    setLoading(false);
  }

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

      const teamsRes = await fetch('/api/teams?mine=true');
      const teamsData = (await teamsRes.json()) as { teams: Team[] };
      if (!active) return;
      const myTeams = teamsData.teams || [];
      setTeams(myTeams);

      const ledTeams = myTeams.filter((t) => t.leaderId === meData.user!.id);
      const entries = await Promise.all(
        ledTeams.map(async (t) => {
          const res = await fetch(`/api/applications?teamId=${t.id}`);
          if (!res.ok) return [t.id, []] as const;
          const data = (await res.json()) as { applications: IncomingApplication[] };
          return [t.id, data.applications || []] as const;
        })
      );
      if (!active) return;
      setIncomingByTeam(Object.fromEntries(entries));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleDecision(appId: string, status: 'ACCEPTED' | 'REJECTED') {
    setFeedback('');
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setFeedback(data.error || 'Gagal memproses lamaran.');
      return;
    }
    setFeedback(
      status === 'ACCEPTED'
        ? 'Pelamar diterima dan ditambahkan ke anggota tim.'
        : 'Lamaran ditolak.'
    );
    await loadAll();
  }

  async function toggleLobbyStatus(team: Team) {
    const nextStatus = team.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    const res = await fetch(`/api/teams/${team.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      await loadAll();
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Masuk Diperlukan</h1>
        <p className="mt-2 text-sm text-slate-600">
          Silakan masuk untuk melihat daftar tim yang kamu pimpin atau ikuti.
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tim Saya</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola lobi tim yang kamu buat dan tinjau pelamar yang mengajukan bergabung.
          </p>
        </div>
        <Link
          href="/teams/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Buat Tim Baru
        </Link>
      </div>

      {feedback && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-900"
        >
          {feedback}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-800">
            Kamu belum tergabung dalam tim mana pun.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Cari Tim
            </Link>
            <Link
              href="/teams/new"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Buat Tim
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {teams.map((team) => {
            const isLeader = team.leaderId === user.id;
            const incoming = incomingByTeam[team.id] || [];

            return (
              <section
                key={team.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge category={team.category} />
                      <GoalBadge goalLevel={team.goalLevel} />
                      {isLeader && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          <Crown className="h-3 w-3" aria-hidden="true" /> Ketua Tim
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">{team.name}</h2>
                    <p className="text-sm font-medium text-indigo-700">{team.competitionName}</p>
                  </div>

                  {isLeader && (
                    <button
                      type="button"
                      onClick={() => toggleLobbyStatus(team)}
                      className={`rounded-lg border px-3.5 py-2 text-xs font-semibold ${
                        team.status === 'OPEN'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Status: {team.status === 'OPEN' ? 'Open Lobby (Klik untuk Tutup)' : 'Closed (Klik untuk Buka)'}
                    </button>
                  )}
                </div>

                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Anggota ({team.members.length}/{team.maxMembers})
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {team.members.map((m) => (
                        <li
                          key={m.userId}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <div>
                            <span className="font-medium text-slate-900">{m.fullName}</span>
                            <p className="text-xs text-slate-500">{m.faculty}</p>
                          </div>
                          <RoleBadge role={m.role} />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Slot Role Dibutuhkan
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {team.neededRoles.length > 0 ? (
                        team.neededRoles.map((nr) => (
                          <RoleBadge key={nr.role} role={nr.role} count={nr.count} />
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">Semua slot sudah terisi.</span>
                      )}
                    </div>
                  </div>
                </div>

                {isLeader && (
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <h3 className="text-sm font-bold text-slate-900">
                      Pelamar Masuk ({incoming.length})
                    </h3>
                    {incoming.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">
                        Belum ada mahasiswa yang melamar ke tim ini.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-3">
                        {incoming.map((app) => (
                          <li
                            key={app.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-slate-900">
                                  {app.applicant?.fullName || 'Mahasiswa'}
                                </span>
                                <RoleBadge role={app.appliedRole} />
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    app.status === 'PENDING'
                                      ? 'bg-amber-100 text-amber-800'
                                      : app.status === 'ACCEPTED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </div>
                              {app.applicant && (
                                <p className="text-xs text-slate-600">
                                  {app.applicant.faculty} • {app.applicant.hoursAvailable} jam/minggu
                                </p>
                              )}
                              {app.message && (
                                <p className="text-sm text-slate-700">&ldquo;{app.message}&rdquo;</p>
                              )}
                              {app.applicant && (
                                <div className="flex flex-wrap gap-3 pt-1 text-xs">
                                  {app.applicant.githubUrl && (
                                    <a
                                      href={app.applicant.githubUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                                    >
                                      GitHub <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                  {app.applicant.linkedinUrl && (
                                    <a
                                      href={app.applicant.linkedinUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                                    >
                                      LinkedIn <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>

                            {app.status === 'PENDING' && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDecision(app.id, 'ACCEPTED')}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                >
                                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                  Terima
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDecision(app.id, 'REJECTED')}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                                  Tolak
                                </button>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
