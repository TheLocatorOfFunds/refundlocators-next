'use client';

export default function ScrollToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        flex: 1, background: 'var(--glass)', color: 'var(--cream)',
        fontWeight: 600, fontSize: 14, border: '1px solid var(--border)',
        padding: '12px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer',
      }}
    >
      Chat with Lauren ↑
    </button>
  );
}
