import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { AuthField } from '@/features/auth/components/auth-field';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { useLogin } from '@/features/auth/hooks/use-auth-mutations';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth.schemas';
import { ApiError } from '@/lib/api-client';

export function LoginPage() {
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string | undefined>>>(
    {},
  );
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    document.title = 'Login | DevLog';
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      setErrors({ email: fields.email?.[0], password: fields.password?.[0] });
      return;
    }
    setErrors({});
    try {
      await login.mutateAsync(result.data);
      const state = location.state as { returnTo?: string } | null;
      await navigate(state?.returnTo ?? '/', { replace: true });
    } catch {
      // The mutation exposes the mapped, user-facing error below.
    }
  }

  const errorMessage =
    login.error instanceof ApiError && login.error.status === 429
      ? 'Too many login attempts. Please wait a moment before trying again.'
      : login.error
        ? 'Email or password is incorrect.'
        : null;

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to generate and review your daily reports."
    >
      <form className="mt-6 space-y-4" noValidate onSubmit={(event) => void handleSubmit(event)}>
        {errorMessage ? (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <AuthField
          autoComplete="email"
          error={errors.email}
          id="email"
          label="Email"
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          type="email"
          value={values.email}
        />
        <AuthField
          autoComplete="current-password"
          error={errors.password}
          id="password"
          label="Password"
          onChange={(event) => setValues({ ...values, password: event.target.value })}
          type="password"
          value={values.password}
        />
        <Button className="w-full" disabled={login.isPending} type="submit">
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        New to DevLog?{' '}
        <Link className="font-medium text-blue-700 hover:underline" to="/register">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
