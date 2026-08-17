import { Button } from '@/components/ui/button';

interface PlaceholderPageProps {
  description: string;
  title: string;
}

export function PlaceholderPage({ description, title }: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
        Developer activity reporting
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">{description}</p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Foundation ready</h2>
        <p className="mt-2 text-slate-600">
          This screen will be implemented in its dedicated feature phase.
        </p>
        <Button className="mt-5" disabled>
          Coming next
        </Button>
      </div>
    </section>
  );
}
