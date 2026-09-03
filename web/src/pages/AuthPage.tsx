import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

export function AuthPage() {
  const { user, login } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  if (user) return <Navigate to="/" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ token: string; user: { id: string; name: string; email: string } }>(`/auth/${registering ? 'register' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify({
          ...(registering ? { name: form.get('name') } : {}),
          email: form.get('email'),
          password: form.get('password')
        })
      });
      login(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue');
    } finally {
      setPending(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-cream to-orange-100 px-4 py-10">
    <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl" aria-labelledby="auth-title">
      <div className="text-center text-5xl" aria-hidden="true">🐾</div>
      <h1 id="auth-title" className="mt-3 text-center text-3xl font-black text-coral">Welcome to PawPal</h1>
      <p className="mt-2 text-center text-slate-600">{registering ? 'Create a home for your pet records.' : 'Good care starts with noticing.'}</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        {registering && <div><label htmlFor="name">Your name</label><input id="name" name="name" required minLength={2} autoComplete="name" /></div>}
        <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div><label htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength={8} autoComplete={registering ? 'new-password' : 'current-password'} /></div>
        <button className="btn w-full" disabled={pending}>{pending ? 'Please wait…' : registering ? 'Create account' : 'Log in'}</button>
      </form>
      <button type="button" className="mt-5 w-full text-sm font-semibold text-coral underline" onClick={() => { setRegistering(!registering); setError(''); }}>
        {registering ? 'Already registered? Log in' : 'New to PawPal? Create an account'}
      </button>
    </section>
  </main>;
}
