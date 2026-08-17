import { GitBranch } from 'lucide-react';

export function ConnectionEmptyState() {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <GitBranch aria-hidden="true" className="mx-auto text-slate-400" />
      <h2 className="mt-4 text-lg font-semibold text-slate-950">No Git accounts connected yet</h2>
      <p className="mt-2 text-slate-600">Connect GitHub or GitLab to start generating reports.</p>
    </section>
  );
}
