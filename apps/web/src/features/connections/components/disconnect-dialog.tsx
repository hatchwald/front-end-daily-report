import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';

interface DisconnectDialogProps {
  accountName: string;
  isDisconnecting: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DisconnectDialog({
  accountName,
  isDisconnecting,
  isOpen,
  onCancel,
  onConfirm,
}: DisconnectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl p-0 backdrop:bg-slate-950/40"
      onCancel={onCancel}
      ref={dialogRef}
    >
      <section className="p-6">
        <h2 className="text-xl font-semibold text-slate-950">Disconnect {accountName}?</h2>
        <p className="mt-2 text-slate-600">
          This removes the account connection from DevLog. Generated reports remain available.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            className="bg-transparent text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
            disabled={isDisconnecting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-700 hover:bg-red-800"
            disabled={isDisconnecting}
            onClick={onConfirm}
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </div>
      </section>
    </dialog>
  );
}
