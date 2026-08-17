import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { AuthField } from '@/features/auth/components/auth-field';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { useRegister } from '@/features/auth/hooks/use-auth-mutations';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/auth.schemas';
import { ApiError } from '@/lib/api-client';

export function RegisterPage() {
  const [values, setValues] = useState<RegisterFormValues>({ email: '', name: '', password: '' });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string | undefined>>
  >({});
  const register = useRegister();
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'Register | DevLog';
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      setErrors({
        email: fields.email?.[0],
        name: fields.name?.[0],
        password: fields.password?.[0],
      });
      return;
    }
    setErrors({});
    try {
      await register.mutateAsync({
        email: result.data.email,
        password: result.data.password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(result.data.name ? { name: result.data.name } : {}),
      });
      await navigate('/', { replace: true });
    } catch {
      // The mutation exposes the mapped, user-facing error below.
    }
  }

  const errorMessage =
    register.error instanceof ApiError && register.error.status === 409
      ? 'An account with this email already exists.'
      : register.error instanceof ApiError && register.error.status === 429
        ? 'Too many requests. Please wait a moment before trying again.'
        : register.error
          ? 'Unable to create your account. Please try again.'
          : null;

  return (
    <AuthShell
      title="Create your account"
      description="Start turning Git activity into clear daily reports."
    >
      <form className="mt-6 space-y-4" noValidate onSubmit={(event) => void handleSubmit(event)}>
        {errorMessage ? (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <AuthField
          autoComplete="name"
          error={errors.name}
          id="name"
          label="Name (optional)"
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          value={values.name}
        />
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
          autoComplete="new-password"
          error={errors.password}
          id="password"
          label="Password"
          onChange={(event) => setValues({ ...values, password: event.target.value })}
          type="password"
          value={values.password}
        />
        <p className="text-xs text-slate-500">Use at least 12 characters.</p>
        <Button className="w-full" disabled={register.isPending} type="submit">
          {register.isPending ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link className="font-medium text-blue-700 hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
