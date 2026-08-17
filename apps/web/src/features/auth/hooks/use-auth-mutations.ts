import { useMutation, useQueryClient } from '@tanstack/react-query';

import { login, logout, register } from '@/features/auth/api/auth.api';
import type { LoginInput, RegisterInput } from '@/features/auth/auth.types';
import { authKeys } from '@/features/auth/hooks/use-current-user';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user) => queryClient.setQueryData(authKeys.currentUser, user),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (user) => queryClient.setQueryData(authKeys.currentUser, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.removeQueries({ queryKey: authKeys.currentUser }),
  });
}
