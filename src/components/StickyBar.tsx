'use client';

export default function StickyBar() {
  return (
    <div style={{
      position: 'fixed', insetInline: 0, bottom: 0, zIndex: 200,
      background: 'rgba(5,17,31,.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border)',
      padding: '10px 16px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      display: 'flex', gap: 10,
    }}>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          flex: 1, minHeight: 46, background: 'var(--glass)', color: 'var(--cream)',
          border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
          font: '600 14px var(--font)', cursor: 'pointer',
        }}
      >💬 Ask Lauren</button>
      <a href="tel:+15135162306" style={{
        flex: 1, minHeight: 46, background: 'var(--gold)', color: 'var(--bg)',
        border: 'none', borderRadius: 'var(--r-md)',
        font: '700 14px var(--font)', cursor: 'pointer', textDecoration: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        boxShadow: 'var(--shadow-gold)',
      }}>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
        </svg>
        Call Nathan
      </a>
    </div>
  );
}
