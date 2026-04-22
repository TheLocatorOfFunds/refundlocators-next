'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') || '/admin/train';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(from);
      } else {
        setError('Wrong password.');
      }
    } catch {
      setError('Something went wrong.');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font)',
    }}>
      <div style={{
        width: 320, padding: '40px 32px',
        background: 'rgba(255,255,255,.03)',
        border: '1px solid var(--border)',
        borderRadius: 8,
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            RefundLocators
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cream)', letterSpacing: '-.02em', margin: 0 }}>
            Admin
          </h1>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              background: 'rgba(255,255,255,.06)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '11px 14px',
              font: '14px var(--font)',
              color: 'var(--cream)',
              outline: 'none',
            }}
          />
          {error && (
            <div style={{ fontSize: 13, color: '#f87171' }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: 'var(--gold)', color: 'var(--bg)',
              border: 'none', borderRadius: 4,
              padding: '11px 0', font: '700 14px var(--font)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
