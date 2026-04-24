'use client';

export function ScrollChip({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        fontSize: 11, fontWeight: 600, color: 'var(--cream-45)',
        background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)',
        padding: '4px 10px', borderRadius: 'var(--r-pill)', cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

export function ScrollCTA() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 700, color: 'var(--gold)',
        background: 'var(--gold-bg)', border: '1px solid var(--border-g)',
        padding: '8px 16px', borderRadius: 'var(--r-pill)', cursor: 'pointer',
      }}
    >
      Start your free lookup →
    </button>
  );
}
