'use client';

/**
 * LaurenAdmin — split-pane viewer for /admin/lauren
 *
 * Left: paginated list of conversations (newest first), filter for converts.
 * Right: full transcript reader for the selected conversation.
 *
 * No frills — function over polish. The DCC will get a prettier version
 * later; this exists so Nathan can read transcripts today.
 */

import { useEffect, useState, useCallback } from 'react';

interface ChatMsg { role: 'user' | 'assistant'; content: string }

interface ListRow {
  id: string;
  visitor_id: string;
  started_at: string;
  last_message_at: string;
  page_origin: string | null;
  token: string | null;
  seed_message: string | null;
  message_count: number;
  submitted_claim: boolean;
  first_question: string | null;
}

interface Detail {
  id: string;
  visitor_id: string;
  started_at: string;
  last_message_at: string;
  page_origin: string | null;
  token: string | null;
  seed_message: string | null;
  transcript: ChatMsg[];
  message_count: number;
  submitted_claim: boolean;
  user_agent: string | null;
  ip: string | null;
}

const PAGE_SIZE = 50;

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60)        return `${diffSec}s ago`;
  if (diffSec < 3600)      return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86_400)    return `${Math.round(diffSec / 3600)}h ago`;
  if (diffSec < 86_400*7)  return `${Math.round(diffSec / 86_400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function LaurenAdmin() {
  const [rows, setRows] = useState<ListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [convertedOnly, setConvertedOnly] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    const sp = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
      ...(convertedOnly ? { converted: '1' } : {}),
    });
    const res = await fetch(`/api/admin/lauren/list?${sp}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.rows || []);
      setTotal(data.total || 0);
    }
    setLoadingList(false);
  }, [offset, convertedOnly]);

  useEffect(() => { loadList(); }, [loadList]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    setLoadingDetail(true);
    fetch(`/api/admin/lauren/${selectedId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setDetail(d))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div style={S.root}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <span style={S.brandDot} />
          <h1 style={S.title}>Lauren conversations</h1>
          <span style={S.totalPill}>{total.toLocaleString()} total</span>
        </div>
        <div style={S.headerRight}>
          <label style={S.toggleLabel}>
            <input
              type="checkbox"
              checked={convertedOnly}
              onChange={e => { setConvertedOnly(e.target.checked); setOffset(0); }}
            />
            <span>Converted only</span>
          </label>
          <a href="/admin/train" style={S.navLink}>← Trainer</a>
        </div>
      </header>

      {/* ── Split pane ─────────────────────────────────────── */}
      <div style={S.split}>
        {/* List */}
        <div style={S.list}>
          {loadingList && <div style={S.empty}>Loading…</div>}
          {!loadingList && rows.length === 0 && (
            <div style={S.empty}>
              No conversations yet.{' '}
              {convertedOnly && <span>Try toggling off &ldquo;Converted only.&rdquo;</span>}
            </div>
          )}
          {!loadingList && rows.map(row => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelectedId(row.id)}
              style={{
                ...S.listItem,
                ...(selectedId === row.id ? S.listItemActive : {}),
              }}
            >
              <div style={S.listItemTop}>
                <span style={S.listItemTime}>{formatRelative(row.started_at)}</span>
                {row.submitted_claim && <span style={S.convertedBadge}>✓ claim</span>}
              </div>
              <div style={S.listItemPreview}>
                {row.first_question || <em style={{ color: '#7a7a7a' }}>(no user message)</em>}
              </div>
              <div style={S.listItemMeta}>
                {row.message_count} msgs · {row.page_origin || '/'}
                {row.seed_message ? ' · seeded' : ''}
              </div>
            </button>
          ))}

          {/* Pagination */}
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
              <span style={S.pageInfo}>page {page} / {totalPages}</span>
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

        {/* Detail */}
        <div style={S.detail}>
          {!selectedId && (
            <div style={S.detailEmpty}>
              Select a conversation on the left to read the transcript.
            </div>
          )}
          {selectedId && loadingDetail && <div style={S.detailEmpty}>Loading…</div>}
          {selectedId && detail && (
            <>
              <div style={S.detailMeta}>
                <div style={S.metaRow}>
                  <span style={S.metaK}>Started</span>
                  <span style={S.metaV}>{formatFull(detail.started_at)}</span>
                </div>
                <div style={S.metaRow}>
                  <span style={S.metaK}>Last activity</span>
                  <span style={S.metaV}>{formatFull(detail.last_message_at)} ({formatRelative(detail.last_message_at)})</span>
                </div>
                <div style={S.metaRow}>
                  <span style={S.metaK}>Page</span>
                  <span style={S.metaV}>{detail.page_origin || '—'}</span>
                </div>
                {detail.token && (
                  <div style={S.metaRow}>
                    <span style={S.metaK}>Property</span>
                    <span style={S.metaV}>{detail.token}</span>
                  </div>
                )}
                {detail.seed_message && (
                  <div style={S.metaRow}>
                    <span style={S.metaK}>Auto-seed</span>
                    <span style={S.metaV} title={detail.seed_message}>
                      {detail.seed_message.slice(0, 80)}{detail.seed_message.length > 80 ? '…' : ''}
                    </span>
                  </div>
                )}
                <div style={S.metaRow}>
                  <span style={S.metaK}>Visitor</span>
                  <span style={S.metaV}>
                    <code style={S.code}>{detail.visitor_id}</code>
                  </span>
                </div>
                <div style={S.metaRow}>
                  <span style={S.metaK}>Outcome</span>
                  <span style={S.metaV}>
                    {detail.submitted_claim
                      ? <span style={S.convertedBadge}>✓ submitted claim</span>
                      : <span style={{ color: '#7a7a7a' }}>—</span>}
                  </span>
                </div>
              </div>

              <div style={S.transcript}>
                {detail.transcript.map((m, i) => (
                  <div key={i} style={bubbleRow(m.role)}>
                    <div style={bubble(m.role)}>{m.content}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inline styles (kept here so this page is self-contained, no CSS imports)
const C = {
  bg:      '#0a0a0a',
  panel:   '#111',
  border:  'rgba(255,255,255,0.08)',
  hover:   'rgba(255,255,255,0.04)',
  active:  'rgba(201,162,74,0.10)',
  cream:   '#f0ece4',
  cream70: 'rgba(240,236,228,0.70)',
  cream45: 'rgba(240,236,228,0.45)',
  cream20: 'rgba(240,236,228,0.20)',
  gold:    '#c9a24a',
  green:   '#3ecf8e',
};

type CSS = React.CSSProperties;
const S: { [key: string]: CSS } = {
  root: {
    minHeight: '100vh', background: C.bg, color: C.cream,
    fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', borderBottom: `1px solid ${C.border}`,
    position: 'sticky', top: 0, background: C.bg, zIndex: 10,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 18 },
  brandDot: {
    width: 10, height: 10, borderRadius: '50%', background: C.gold,
    boxShadow: `0 0 0 2px rgba(201,162,74,0.18), 0 0 8px ${C.gold}`,
  },
  title: { fontSize: 17, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' },
  totalPill: {
    fontFamily: 'ui-monospace, SF Mono, monospace', fontSize: 11,
    color: C.cream45, padding: '3px 8px', borderRadius: 10,
    background: C.hover, border: `1px solid ${C.border}`,
  },
  toggleLabel: {
    display: 'flex', alignItems: 'center', gap: 7, fontSize: 13,
    color: C.cream70, cursor: 'pointer', userSelect: 'none',
  },
  navLink: {
    fontSize: 12, color: C.cream45, textDecoration: 'none',
    padding: '6px 10px', borderRadius: 6, border: `1px solid ${C.border}`,
  },
  split: {
    display: 'grid', gridTemplateColumns: '380px 1fr',
    minHeight: 'calc(100vh - 57px)',
  },
  list: {
    borderRight: `1px solid ${C.border}`, overflowY: 'auto',
    maxHeight: 'calc(100vh - 57px)',
  },
  empty: { padding: 32, color: C.cream45, fontSize: 13, textAlign: 'center' },
  listItem: {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '14px 18px', background: 'transparent', color: 'inherit',
    border: 0, borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  listItemActive: { background: C.active },
  listItemTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  listItemTime: {
    fontFamily: 'ui-monospace, SF Mono, monospace', fontSize: 11,
    color: C.cream45, letterSpacing: '0.02em',
  },
  listItemPreview: {
    fontSize: 13.5, color: C.cream, lineHeight: 1.4,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  listItemMeta: {
    fontSize: 10.5, color: C.cream45, marginTop: 4,
    fontFamily: 'ui-monospace, SF Mono, monospace',
  },
  convertedBadge: {
    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
    background: 'rgba(62,207,142,0.15)', color: C.green, letterSpacing: '0.04em',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', gap: 12,
  },
  pageBtn: {
    fontSize: 12, padding: '6px 12px', borderRadius: 6,
    background: C.hover, color: C.cream70, border: `1px solid ${C.border}`,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  pageInfo: { fontSize: 11, color: C.cream45, fontFamily: 'ui-monospace, SF Mono, monospace' },
  detail: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  detailEmpty: {
    flex: 1, display: 'grid', placeItems: 'center', color: C.cream45, fontSize: 14,
  },
  detailMeta: {
    padding: '18px 24px', borderBottom: `1px solid ${C.border}`,
    background: C.panel, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px',
  },
  metaRow: { display: 'flex', gap: 10, fontSize: 12, alignItems: 'baseline' },
  metaK: {
    color: C.cream45, fontFamily: 'ui-monospace, SF Mono, monospace',
    fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase',
    minWidth: 78,
  },
  metaV: { color: C.cream, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' },
  code: {
    fontFamily: 'ui-monospace, SF Mono, monospace', fontSize: 11,
    color: C.cream70, padding: '1px 6px', borderRadius: 4, background: C.hover,
  },
  transcript: {
    flex: 1, overflowY: 'auto', padding: '20px 24px',
    display: 'flex', flexDirection: 'column', gap: 8,
    maxHeight: 'calc(100vh - 57px - 200px)',
  },
};

// Dynamic styles (per-message) live separately so the static-style typing
// on S above can be a clean Record<string, CSSProperties>.
const bubbleRow = (role: string): CSS => ({
  display: 'flex',
  justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
  maxWidth: '100%',
});
const bubble = (role: string): CSS => ({
  maxWidth: '78%', padding: '10px 14px', borderRadius: 16,
  fontSize: 14, lineHeight: 1.45, whiteSpace: 'pre-wrap',
  background: role === 'user' ? C.gold : 'rgba(240,236,228,0.07)',
  color: role === 'user' ? C.bg : C.cream,
  borderBottomRightRadius: role === 'user' ? 6 : 16,
  borderBottomLeftRadius:  role === 'user' ? 16 : 6,
});
