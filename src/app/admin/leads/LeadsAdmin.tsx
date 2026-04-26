'use client';

/**
 * LeadsAdmin — the click-to-text outreach workflow.
 *
 * Three tabs: Ready (untexted, has phone) / Texted / All.
 * Each row shows recipient + case info + a big gold "Text [first]" button
 * that opens iMessage with a prefilled body containing their personalized
 * URL. After clicking, we POST to /api/admin/leads/[token]/text to mark
 * it sent so it drops off the Ready queue.
 */

import { useCallback, useEffect, useState } from 'react';

interface Row {
  token: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  property_address: string | null;
  county: string | null;
  sale_date: string | null;
  estimated_surplus_low: number | null;
  estimated_surplus_high: number | null;
  case_number: string | null;
  source: string | null;
  created_at: string;
  texted_at: string | null;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  responded_at: string | null;
  claim_submitted_at: string | null;
}

type Status = 'ready' | 'texted' | 'all';

const PAGE_SIZE = 50;

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n: number | null): string {
  if (n == null) return '—';
  return n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n.toLocaleString('en-US')}`;
}

function fmtPhone(p: string | null): string {
  if (!p) return '—';
  const digits = p.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === '1') return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  return p;
}

function fmtRelative(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 60)        return `${sec}s ago`;
  if (sec < 3600)      return `${Math.round(sec / 60)}m ago`;
  if (sec < 86_400)    return `${Math.round(sec / 3600)}h ago`;
  if (sec < 86_400*7)  return `${Math.round(sec / 86_400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function smsHref(row: Row): string {
  if (!row.phone) return '';
  const digits = row.phone.replace(/\D/g, '');
  const phone = digits.length === 10 ? `+1${digits}` : `+${digits}`;
  const first = (row.first_name || '').trim();
  const addr  = (row.property_address || '').split(',')[0].trim();
  const county = (row.county || '').trim();
  const mid = row.estimated_surplus_low && row.estimated_surplus_high
    ? Math.round(((row.estimated_surplus_low + row.estimated_surplus_high) / 2) / 1000)
    : null;

  // Compose the message — short, named, names the property + county +
  // surplus estimate, includes the personalized URL.
  const body =
    `Hi${first ? ' ' + first : ''} — Nathan with RefundLocators. ${county || 'Your'} County may be holding ` +
    (mid ? `~$${mid}k` : 'surplus funds') +
    ` from your ${addr || 'former'} sale. Details: refundlocators.com/s/${row.token}`;

  return `sms:${phone}&body=${encodeURIComponent(body)}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function LeadsAdmin() {
  const [status, setStatus] = useState<Status>('ready');
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<{ ready: number; texted: number; all: number }>({ ready: 0, texted: 0, all: 0 });
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCounts = useCallback(async () => {
    const fetchCount = async (s: Status) => {
      const r = await fetch(`/api/admin/leads/list?status=${s}&limit=1`);
      if (!r.ok) return 0;
      const d = await r.json();
      return d.total || 0;
    };
    const [ready, texted, all] = await Promise.all([
      fetchCount('ready'), fetchCount('texted'), fetchCount('all'),
    ]);
    setCounts({ ready, texted, all });
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams({
      status,
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    const res = await fetch(`/api/admin/leads/list?${sp}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.rows || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [status, offset]);

  useEffect(() => { loadRows(); }, [loadRows]);
  useEffect(() => { loadCounts(); }, [loadCounts]);

  const markTexted = async (token: string) => {
    await fetch(`/api/admin/leads/${token}/text`, { method: 'POST' });
    // Optimistic: drop the row from view if we're on Ready
    if (status === 'ready') setRows(prev => prev.filter(r => r.token !== token));
    loadCounts();
  };

  const resetTexted = async (token: string) => {
    await fetch(`/api/admin/leads/${token}/text`, { method: 'DELETE' });
    loadRows(); loadCounts();
  };

  const onTextClick = (row: Row) => {
    const href = smsHref(row);
    if (!href) return;
    // Open the sms: deep link — iPhone Messages catches it on macOS,
    // Continuity sends it; on iPhone it opens Messages directly.
    window.location.href = href;
    // Mark texted after a short delay so the user is in Messages
    // confirming the send before we move it off the Ready queue.
    setTimeout(() => markTexted(row.token), 1500);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div style={S.root}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <span style={S.brandDot} />
          <h1 style={S.title}>Ready to Text</h1>
        </div>
        <div style={S.headerRight}>
          <a href="/admin/lauren" style={S.navLink}>Lauren chats →</a>
          <a href="/admin/train" style={S.navLink}>Trainer →</a>
        </div>
      </header>

      {/* Tabs */}
      <div style={S.tabs}>
        <Tab active={status === 'ready'}  onClick={() => { setStatus('ready');  setOffset(0); }} label="Ready"  count={counts.ready}  />
        <Tab active={status === 'texted'} onClick={() => { setStatus('texted'); setOffset(0); }} label="Texted" count={counts.texted} />
        <Tab active={status === 'all'}    onClick={() => { setStatus('all');    setOffset(0); }} label="All"    count={counts.all}    />
      </div>

      {/* Content */}
      {loading && <div style={S.empty}>Loading…</div>}

      {!loading && rows.length === 0 && (
        <div style={S.empty}>
          {status === 'ready' && (
            <>
              <strong style={{ display: 'block', marginBottom: 8, color: '#f0ece4' }}>
                No leads ready to text.
              </strong>
              Once Castle writes rows to <code style={S.code}>personalized_links</code> with
              phone numbers populated, they&apos;ll appear here.
            </>
          )}
          {status === 'texted' && 'Nothing texted yet — go send some.'}
          {status === 'all'    && 'No leads with phone numbers in the database.'}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div style={S.list}>
          {rows.map(row => (
            <div key={row.token} style={S.row}>
              <div style={S.rowMain}>
                <div style={S.name}>
                  {row.first_name} {row.last_name}
                  {row.claim_submitted_at && <span style={S.badgeClaim}>✓ submitted claim</span>}
                  {row.responded_at && !row.claim_submitted_at && <span style={S.badgeResponded}>responded</span>}
                  {row.first_viewed_at && !row.responded_at && <span style={S.badgeViewed}>viewed {row.view_count}×</span>}
                </div>
                <div style={S.addr}>{row.property_address}</div>
                <div style={S.metaRow}>
                  <span style={S.metaItem}><span style={S.metaK}>County</span>{row.county}</span>
                  <span style={S.metaItem}><span style={S.metaK}>Surplus</span>{fmtMoney(row.estimated_surplus_low)}–{fmtMoney(row.estimated_surplus_high)}</span>
                  <span style={S.metaItem}><span style={S.metaK}>Phone</span>{fmtPhone(row.phone)}</span>
                  <span style={S.metaItem}><span style={S.metaK}>Case</span>{row.case_number || '—'}</span>
                </div>
                <div style={S.metaRow}>
                  <span style={S.metaTime}>Castle picked up {fmtRelative(row.created_at)}</span>
                  {row.texted_at && <span style={S.metaTime}>· texted {fmtRelative(row.texted_at)}</span>}
                  {row.first_viewed_at && <span style={S.metaTime}>· first viewed {fmtRelative(row.first_viewed_at)}</span>}
                  {row.last_viewed_at && row.last_viewed_at !== row.first_viewed_at && <span style={S.metaTime}>· last seen {fmtRelative(row.last_viewed_at)}</span>}
                </div>
              </div>

              <div style={S.rowActions}>
                <a
                  href={`/s/${row.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.previewBtn}
                  title="Preview the page they'll see"
                >
                  preview ↗
                </a>
                {row.texted_at ? (
                  <button
                    type="button"
                    onClick={() => resetTexted(row.token)}
                    style={S.resetBtn}
                    title="Bring this lead back to the Ready queue"
                  >
                    reset
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onTextClick(row)}
                    style={S.textBtn}
                    disabled={!row.phone}
                  >
                    Text {row.first_name || 'lead'} →
                  </button>
                )}
              </div>
            </div>
          ))}

          {total > PAGE_SIZE && (
            <div style={S.pagination}>
              <button
                type="button"
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0}
                style={S.pageBtn}
              >
                ← prev
              </button>
              <span style={S.pageInfo}>page {page} / {totalPages} · {total} total</span>
              <button
                type="button"
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total}
                style={S.pageBtn}
              >
                next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Tab({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...S.tab,
        ...(active ? S.tabActive : {}),
      }}
    >
      {label}
      <span style={{ ...S.tabCount, ...(active ? S.tabCountActive : {}) }}>
        {count.toLocaleString()}
      </span>
    </button>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const C = {
  bg:      '#0a0a0a',
  panel:   '#111',
  hover:   'rgba(255,255,255,0.04)',
  border:  'rgba(255,255,255,0.08)',
  cream:   '#f0ece4',
  cream70: 'rgba(240,236,228,0.70)',
  cream45: 'rgba(240,236,228,0.45)',
  cream20: 'rgba(240,236,228,0.20)',
  gold:    '#c9a24a',
  goldHi:  '#d8b560',
  green:   '#3ecf8e',
  blue:    '#4ea4ff',
};

type CSS = React.CSSProperties;
const S: { [key: string]: CSS } = {
  root: {
    minHeight: '100vh', background: C.bg, color: C.cream,
    fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif',
    paddingBottom: 60,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', borderBottom: `1px solid ${C.border}`,
    position: 'sticky', top: 0, background: C.bg, zIndex: 10,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  brandDot: {
    width: 10, height: 10, borderRadius: '50%', background: C.gold,
    boxShadow: `0 0 0 2px rgba(201,162,74,0.18), 0 0 8px ${C.gold}`,
  },
  title: { fontSize: 17, fontWeight: 600, margin: 0 },
  navLink: {
    fontSize: 12, color: C.cream45, textDecoration: 'none',
    padding: '6px 10px', borderRadius: 6, border: `1px solid ${C.border}`,
  },
  tabs: {
    display: 'flex', gap: 4, padding: '14px 24px 0',
    borderBottom: `1px solid ${C.border}`,
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', background: 'transparent', color: C.cream70,
    border: 0, borderBottom: '2px solid transparent', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
    transition: 'color 120ms, border-color 120ms',
  },
  tabActive: { color: C.cream, borderBottomColor: C.gold },
  tabCount: {
    fontSize: 11, fontFamily: 'ui-monospace, SF Mono, monospace',
    background: C.hover, color: C.cream45, padding: '2px 7px', borderRadius: 10,
  },
  tabCountActive: { background: 'rgba(201,162,74,0.15)', color: C.gold },
  empty: { padding: '60px 24px', color: C.cream45, fontSize: 14, textAlign: 'center', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 },
  code: {
    fontFamily: 'ui-monospace, SF Mono, monospace', fontSize: 12,
    color: C.cream70, padding: '1px 6px', borderRadius: 4, background: C.hover,
  },
  list: { padding: '14px 24px 0', display: 'flex', flexDirection: 'column', gap: 10 },
  row: {
    display: 'grid', gridTemplateColumns: '1fr auto', gap: 18,
    alignItems: 'center', padding: '16px 18px',
    background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
  },
  rowMain: { minWidth: 0 },
  name: {
    fontSize: 15, fontWeight: 600, color: C.cream,
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  badgeClaim: {
    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
    background: 'rgba(62,207,142,0.15)', color: C.green, letterSpacing: '0.04em',
  },
  badgeResponded: {
    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
    background: 'rgba(201,162,74,0.15)', color: C.gold, letterSpacing: '0.04em',
  },
  badgeViewed: {
    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
    background: 'rgba(78,164,255,0.15)', color: C.blue, letterSpacing: '0.04em',
  },
  addr: { fontSize: 13, color: C.cream70, marginBottom: 8 },
  metaRow: {
    display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12,
    color: C.cream70, alignItems: 'baseline',
  },
  metaItem: { display: 'inline-flex', alignItems: 'baseline', gap: 6, fontFamily: 'ui-monospace, SF Mono, monospace' },
  metaK: { color: C.cream45, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' },
  metaTime: { fontSize: 11, color: C.cream45, fontFamily: 'ui-monospace, SF Mono, monospace' },
  rowActions: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6 },
  textBtn: {
    appearance: 'none', border: 0,
    padding: '11px 18px', borderRadius: 10,
    background: C.gold, color: C.bg,
    fontFamily: 'inherit', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
    cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'background 120ms',
  },
  previewBtn: {
    fontSize: 11, color: C.cream45, textDecoration: 'none', textAlign: 'center',
    padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.border}`,
  },
  resetBtn: {
    fontSize: 11, color: C.cream45, background: 'transparent',
    border: `1px solid ${C.border}`, padding: '5px 10px', borderRadius: 6,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 4px', gap: 12,
  },
  pageBtn: {
    fontSize: 12, padding: '6px 12px', borderRadius: 6,
    background: C.hover, color: C.cream70, border: `1px solid ${C.border}`,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  pageInfo: { fontSize: 11, color: C.cream45, fontFamily: 'ui-monospace, SF Mono, monospace' },
};
