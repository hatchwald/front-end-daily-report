import { useCallback, useEffect, useRef, useState } from 'react';

import { redirectToAuthorizationUrl } from '@/features/connections/api/connections.api';
import { useConnections } from '@/features/connections/hooks/use-connections';
import { environment } from '@/lib/env';

type AuthorizationStatus = 'idle' | 'authorizing' | 'success' | 'error';

function connectionFingerprint(connections: ReturnType<typeof useConnections>['data']) {
  return (connections ?? [])
    .map((connection) => `${connection.id}:${connection.status}`)
    .sort()
    .join('|');
}

function isSuccessMessage(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const message = data as Record<string, unknown>;
  return message.success === true || message.status === 'success';
}

export function useConnectionAuthorization(onSuccess?: () => void) {
  const { data: connections, refetch } = useConnections();
  const [status, setStatus] = useState<AuthorizationStatus>('idle');
  const popupRef = useRef<Window | null>(null);
  const baselineRef = useRef('');
  const closedChecksRef = useRef(0);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const completeSuccessfully = useCallback(async () => {
    popupRef.current?.close();
    popupRef.current = null;
    await refetch();
    setStatus('success');
    onSuccessRef.current?.();
  }, [refetch]);

  useEffect(() => {
    if (status !== 'authorizing') return;

    async function checkConnectionState() {
      const result = await refetch();
      if (result.data && connectionFingerprint(result.data) !== baselineRef.current) {
        await completeSuccessfully();
        return;
      }
      if (popupRef.current?.closed) {
        closedChecksRef.current += 1;
        if (closedChecksRef.current >= 5) {
          popupRef.current = null;
          setStatus('idle');
        }
      }
    }

    function handleMessage(event: MessageEvent<unknown>) {
      if (event.origin !== new URL(environment.VITE_API_BASE_URL).origin) return;
      if (isSuccessMessage(event.data)) void completeSuccessfully();
    }

    window.addEventListener('message', handleMessage);
    const intervalId = window.setInterval(() => void checkConnectionState(), 1_000);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.clearInterval(intervalId);
    };
  }, [completeSuccessfully, refetch, status]);

  useEffect(() => {
    if (status !== 'success') return;
    const timeoutId = window.setTimeout(() => setStatus('idle'), 4_000);
    return () => window.clearTimeout(timeoutId);
  }, [status]);

  async function startAuthorization(getAuthorizationUrl: () => Promise<string>) {
    setStatus('authorizing');
    closedChecksRef.current = 0;
    baselineRef.current = connectionFingerprint(connections);
    const popup = window.open('', 'devlog-git-authorization', 'popup=yes,width=720,height=760');
    if (!popup) {
      setStatus('error');
      return;
    }
    popupRef.current = popup;
    popup.document.title = 'Connecting Git account…';

    try {
      const authorizationUrl = await getAuthorizationUrl();
      redirectToAuthorizationUrl(authorizationUrl, popup);
    } catch {
      popup.close();
      popupRef.current = null;
      setStatus('error');
    }
  }

  return {
    isAuthorizing: status === 'authorizing',
    isError: status === 'error',
    isReady: connections !== undefined,
    isSuccess: status === 'success',
    startAuthorization,
  };
}
