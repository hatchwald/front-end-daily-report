import type { ReactNode } from 'react';

export function AuthShell({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="font-bold text-blue-800">DevLog</p>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 text-slate-600">{description}</p>
        {children}
      </section>
    </main>
  );
}
