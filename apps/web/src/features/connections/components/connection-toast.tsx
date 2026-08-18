import { CircleCheck } from 'lucide-react';

export function ConnectionToast({ message }: { message: string }) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-lg"
      role="status"
    >
      <CircleCheck aria-hidden="true" className="text-emerald-400" size={18} />
      {message}
    </div>
  );
}
