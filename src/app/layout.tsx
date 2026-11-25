import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'SynerTeam — Campus Competition Team Lobby',
  description:
    'Platform pembentukan tim kompetisi mahasiswa berbasis role-based open lobby.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          SynerTeam Sprint 1 — STACK 2026 by GDGoC ITB (Smarter Campus &amp; Learning)
        </footer>
      </body>
    </html>
  );
}
