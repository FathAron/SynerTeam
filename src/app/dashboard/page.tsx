'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Clock, Crown, PlusCircle, Search, Send, Users, X } from 'lucide-react';
import { CategoryBadge, GoalBadge, RoleBadge } from '@/components/RoleBadge';
import {
  CATEGORIES,
  GOAL_LABELS,
  ROLES,
  type Application,
  type GoalLevel,
  type PublicUser,
  type Role,
  type Team,
} from '@/lib/types';

export default function DashboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [myApps, setMyApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('ALL');
  const [role, setRole] = useState('ALL');
  const [goalLevel, setGoalLevel] = useState('ALL');

  // Modal state
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [appliedRole, setAppliedRole] = useState<Role>('Frontend');
  const [message, setMessage] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadData(params?: {
    q?: string;
    category?: string;
    role?: string;
    goalLevel?: string;
  }) {
    const sp = new URLSearchParams();
    if (params?.q) sp.set('q', params.q);
    if (params?.category && params.category !== 'ALL') sp.set('category', params.category);
    if (params?.role && params.role !== 'ALL') sp.set('role', params.role);
    if (params?.goalLevel && params.goalLevel !== 'ALL') sp.set('goalLevel', params.goalLevel);

    const [teamsRes, meRes] = await Promise.all([
      fetch(`/api/teams?${sp.toString()}`),
      fetch('/api/auth/me'),
    ]);
    const teamsData = (await teamsRes.json()) as { teams: Team[] };
    const meData = (await meRes.json()) as { user: PublicUser | null };
    setTeams(teamsData.teams || []);
    setUser(meData.user);

    if (meData.user) {
      const appsRes = await fetch('/api/applications');
      if (appsRes.ok) {
        const appsData = (await appsRes.json()) as { applications: Application[] };
        setMyApps(appsData.applications || []);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const [teamsRes, meRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/auth/me'),
      ]);
      const teamsData = (await teamsRes.json()) as { teams: Team[] };
      const meData = (await meRes.json()) as { user: PublicUser | null };
      if (!active) return;
      setTeams(teamsData.teams || []);
      setUser(meData.user);

      if (meData.user) {
        const appsRes = await fetch('/api/applications');
        if (appsRes.ok && active) {
          const appsData = (await appsRes.json()) as { applications: Application[] };
          setMyApps(appsData.applications || []);
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    loadData({ q, category, role, goalLevel });
  }

  function handleResetFilters() {
    setQ('');
    setCategory('ALL');
    setRole('ALL');
    setGoalLevel('ALL');
    loadData();
  }

  function openTeamDialog(team: Team) {
    setSelectedTeam(team);
    setAppliedRole(team.neededRoles[0]?.role || user?.primaryRole || 'Frontend');
    setMessage('');
    setApplyError('');
    setApplySuccess('');
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
    setSelectedTeam(null);
  }

  async function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedTeam) return;
    setApplyError('');
    setApplySuccess('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          appliedRole,
          message,
        }),
      });
      const data = (await res.json()) as { application?: Application; error?: string };
      if (!res.ok || !data.application) {
        setApplyError(data.error || 'Gagal mengirim lamaran.');
      } else {
        setMyApps((prev) => [data.application!, ...prev]);
        setApplySuccess('Lamaran terkirim! Ketua tim akan meninjau profilmu.');
        setMessage('');
      }
    } catch {
      setApplyError('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  }

  function getMyAppForTeam(teamId: string): Application | undefined {
    return myApps.find((a) => a.teamId === teamId);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Cari Tim</h1>
          <p className="mt-1 text-sm text-slate-600">
            Jelajahi lobi tim kompetisi yang sedang mencari anggota baru.
          </p>
        </div>
        <Link
          href="/teams/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Buat Tim Baru
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <search className="mt-6 block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <label htmlFor="search-q" className="block text-xs font-semibold text-slate-600">
              Cari Nama Tim / Lomba
            </label>
            <div className="relative mt-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="search-q"
                name="q"
                type="search"
                spellCheck={false}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Contoh: STACK, Hackathon, Data..."
                className="block w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="filter-cat" className="block text-xs font-semibold text-slate-600">
              Kategori
            </label>
            <select
              id="filter-cat"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="ALL">Semua</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="filter-role" className="block text-xs font-semibold text-slate-600">
              Role Dicari
            </label>
            <select
              id="filter-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="ALL">Semua Role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="filter-goal" className="block text-xs font-semibold text-slate-600">
              Ambisi
            </label>
            <select
              id="filter-goal"
              name="goalLevel"
              value={goalLevel}
              onChange={(e) => setGoalLevel(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="ALL">Semua</option>
              <option value="1">1 — Eksplorasi</option>
              <option value="2">2 — Target Final</option>
              <option value="3">3 — Target Juara</option>
            </select>
          </div>

          <div className="flex items-end gap-2 md:col-span-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>
      </search>

      {/* Team Grid */}
      {loading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-800">
            Belum ada lobi tim yang sesuai filter.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Coba ubah kata kunci pencarian atau buat lobi timmu sendiri.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {teams.map((team) => {
            const isMember = user ? team.members.some((m) => m.userId === user.id) : false;
            const existingApp = getMyAppForTeam(team.id);

            return (
              <article
                key={team.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge category={team.category} />
                      <GoalBadge goalLevel={team.goalLevel} />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        team.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {team.status === 'OPEN' ? 'Open Lobby' : 'Closed'}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-slate-900">{team.name}</h2>
                  <p className="text-sm font-medium text-indigo-700">{team.competitionName}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{team.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {team.members.length} / {team.maxMembers} Anggota
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {team.requiredHoursPerWeek} jam/minggu
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role Dibutuhkan:
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {team.neededRoles.length > 0 ? (
                        team.neededRoles.map((nr) => (
                          <RoleBadge key={nr.role} role={nr.role} count={nr.count} />
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Slot role sudah terpenuhi</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="text-xs text-slate-500">
                    Leader:{' '}
                    <span className="font-medium text-slate-800">
                      {team.members.find((m) => m.isLeader)?.fullName || 'Ketua Tim'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openTeamDialog(team)}
                    className="rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    {isMember
                      ? 'Lihat Tim (Anggota)'
                      : existingApp
                        ? `Status: ${existingApp.status}`
                        : 'Lihat Detail & Lamar'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Native Modal Dialog for Team Details & Application */}
      <dialog
        ref={dialogRef}
        aria-labelledby="modal-team-title"
        className="m-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
        {selectedTeam && (
          <div className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={selectedTeam.category} />
                  <GoalBadge goalLevel={selectedTeam.goalLevel} />
                </div>
                <h1 id="modal-team-title" className="mt-2 text-xl font-bold text-slate-900">
                  {selectedTeam.name}
                </h1>
                <p className="text-sm font-medium text-indigo-700">
                  {selectedTeam.competitionName}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Tutup dialog"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-sm leading-relaxed text-slate-700">
                {selectedTeam.description}
              </p>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs">
                <div>
                  <span className="text-slate-500">Target Ambisi</span>
                  <p className="mt-0.5 font-semibold text-slate-900">
                    {GOAL_LABELS[selectedTeam.goalLevel as GoalLevel]}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Komitmen Waktu</span>
                  <p className="mt-0.5 font-semibold text-slate-900">
                    {selectedTeam.requiredHoursPerWeek} jam / minggu
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Anggota Saat Ini ({selectedTeam.members.length}/{selectedTeam.maxMembers})
                </h2>
                <ul className="mt-2 space-y-2">
                  {selectedTeam.members.map((m) => (
                    <li
                      key={m.userId}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium text-slate-900">{m.fullName}</span>
                        {m.isLeader && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            <Crown className="h-3 w-3" aria-hidden="true" /> Leader
                          </span>
                        )}
                        <p className="text-xs text-slate-500">{m.faculty}</p>
                      </div>
                      <RoleBadge role={m.role} />
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Slot Role Terbuka
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTeam.neededRoles.length > 0 ? (
                    selectedTeam.neededRoles.map((nr) => (
                      <RoleBadge key={nr.role} role={nr.role} count={nr.count} />
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Tidak ada slot terbuka.</span>
                  )}
                </div>
              </div>

              {/* Application section */}
              <div className="border-t border-slate-200 pt-4">
                {!user ? (
                  <div className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">
                    Ingin bergabung dengan tim ini?{' '}
                    <Link href="/login" className="font-semibold underline">
                      Masuk terlebih dahulu
                    </Link>
                    .
                  </div>
                ) : selectedTeam.members.some((m) => m.userId === user.id) ? (
                  <div className="rounded-xl bg-emerald-50 p-3.5 text-sm font-medium text-emerald-800">
                    Kamu sudah menjadi anggota tim ini.
                  </div>
                ) : getMyAppForTeam(selectedTeam.id) ? (
                  <div className="rounded-xl bg-slate-100 p-3.5 text-sm text-slate-800">
                    Kamu sudah mengirim lamaran ke tim ini (Status:{' '}
                    <strong>{getMyAppForTeam(selectedTeam.id)?.status}</strong>).
                  </div>
                ) : selectedTeam.status !== 'OPEN' || selectedTeam.neededRoles.length === 0 ? (
                  <div className="rounded-xl bg-slate-100 p-3.5 text-sm text-slate-600">
                    Lobi tim ini sedang ditutup atau slot sudah penuh.
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-3" aria-label="Form lamar tim">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Ajukan Bergabung ke Tim
                    </h2>

                    {applyError && (
                      <p role="alert" className="text-xs font-medium text-red-600">
                        {applyError}
                      </p>
                    )}
                    {applySuccess && (
                      <p role="status" className="text-xs font-medium text-emerald-700">
                        {applySuccess}
                      </p>
                    )}

                    <div>
                      <label
                        htmlFor="appliedRole"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Pilih Role yang Dilamar
                      </label>
                      <select
                        id="appliedRole"
                        name="appliedRole"
                        value={appliedRole}
                        onChange={(e) => setAppliedRole(e.target.value as Role)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        {selectedTeam.neededRoles.map((nr) => (
                          <option key={nr.role} value={nr.role}>
                            {nr.role} ({nr.count} slot)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="applyMessage"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Pesan Singkat untuk Ketua Tim
                      </label>
                      <textarea
                        id="applyMessage"
                        name="message"
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Perkenalkan singkat keahlian atau pengalamanmu..."
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={closeDialog}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Tutup
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        {submitting ? 'Mengirim...' : 'Kirim Lamaran'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
