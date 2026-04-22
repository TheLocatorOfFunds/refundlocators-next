'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  id: string;
  session_type: string;
  visitor_id: string | null;
  deal_id: string | null;
  msg_count: number;
  preview: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

interface KnowledgeEntry {
  id: string;
  source_type: string;
  topic: string | null;
  title: string | null;
  content: string;
  created_at: string;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--cream)',
    fontFamily: 'var(--font)',
  } as React.CSSProperties,
  nav: {
    padding: '14px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(5,17,31,.95)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  body: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  tabs: { display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 0 },
  tab: (active: boolean): React.CSSProperties => ({
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 600,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: active ? 'var(--gold)' : 'var(--cream-45)',
    borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
    marginBottom: -1,
    fontFamily: 'var(--font)',
  }),
  card: {
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: 'rgba(255,255,255,.02)',
    padding: '16px 20px',
    marginBottom: 10,
    cursor: 'pointer',
  } as React.CSSProperties,
  badge: (type: string): React.CSSProperties => ({
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    padding: '2px 8px',
    borderRadius: 12,
    background: type === 'homeowner' ? 'rgba(201,162,74,.15)' : 'rgba(99,102,241,.15)',
    color: type === 'homeowner' ? 'var(--gold)' : '#a5b4fc',
    border: `1px solid ${type === 'homeowner' ? 'rgba(201,162,74,.3)' : 'rgba(99,102,241,.3)'}`,
  }),
  input: {
    width: '100%',
    background: 'rgba(255,255,255,.06)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '10px 12px',
    font: '14px var(--font)',
    color: 'var(--cream)',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    background: 'rgba(255,255,255,.06)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '10px 12px',
    font: '14px var(--font)',
    color: 'var(--cream)',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 120,
    boxSizing: 'border-box' as const,
  },
  btnGold: {
    background: 'var(--gold)',
    color: 'var(--bg)',
    border: 'none',
    borderRadius: 4,
    padding: '9px 18px',
    font: '700 13px var(--font)',
    cursor: 'pointer',
  } as React.CSSProperties,
  btnGhost: {
    background: 'transparent',
    color: 'var(--cream-70)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '9px 18px',
    font: '500 13px var(--font)',
    cursor: 'pointer',
  } as React.CSSProperties,
  btnDanger: {
    background: 'transparent',
    color: '#f87171',
    border: '1px solid rgba(248,113,113,.3)',
    borderRadius: 4,
    padding: '9px 18px',
    font: '500 13px var(--font)',
    cursor: 'pointer',
  } as React.CSSProperties,
  label: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--cream-45)',
    marginBottom: 6,
    display: 'block',
  },
};

// ── Session transcript panel ──────────────────────────────────────────────────

function SessionPanel({
  session,
  onClose,
  onAddKnowledge,
}: {
  session: Session;
  onClose: () => void;
  onAddKnowledge: (draft: Partial<KnowledgeEntry>) => void;
}) {
  const msgs = session.messages.filter((m) => m.role === 'user' || m.role === 'assistant');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 480, height: '100vh', overflowY: 'auto',
          background: 'var(--bg)', borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
        }}>
          <div>
            <span style={S.badge(session.session_type)}>{session.session_type}</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--cream-45)' }}>
              {session.msg_count} msgs · {new Date(session.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--cream-45)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {msgs.length === 0 && (
            <div style={{ color: 'var(--cream-45)', fontSize: 13 }}>No messages in this session.</div>
          )}
          {msgs.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              background: m.role === 'user' ? 'var(--gold)' : 'rgba(255,255,255,.07)',
              color: m.role === 'user' ? 'var(--bg)' : 'var(--cream)',
              border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
              borderRadius: 12,
              borderBottomRightRadius: m.role === 'user' ? 3 : 12,
              borderBottomLeftRadius: m.role === 'assistant' ? 3 : 12,
              padding: '9px 13px',
              fontSize: 13,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontWeight: m.role === 'user' ? 500 : 400,
            }}>
              {m.content}
            </div>
          ))}
        </div>

        {/* Footer action */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => onAddKnowledge({
              source_type: 'session',
              topic: '',
              title: `Session ${new Date(session.updated_at).toLocaleDateString()}`,
              content: msgs.map(m => `${m.role === 'user' ? 'Homeowner' : 'Lauren'}: ${m.content}`).join('\n\n'),
            })}
            style={{ ...S.btnGold, width: '100%' }}
          >
            + Add to Knowledge Base
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Knowledge entry form ───────────────────────────────────────────────────────

function KnowledgeForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: Partial<KnowledgeEntry>;
  onSave: (data: Partial<KnowledgeEntry>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [topic, setTopic] = useState(initial.topic || '');
  const [title, setTitle] = useState(initial.title || '');
  const [content, setContent] = useState(initial.content || '');
  const [sourceType, setSourceType] = useState(initial.source_type || 'manual');

  return (
    <div style={{
      border: '1px solid var(--border-g)',
      borderRadius: 6,
      padding: '24px 24px 20px',
      background: 'rgba(201,162,74,.03)',
      marginBottom: 24,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={S.label}>Topic</label>
          <input
            style={S.input}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. fee_objection, probate, scam"
          />
        </div>
        <div>
          <label style={S.label}>Title</label>
          <input
            style={S.input}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Short description"
          />
        </div>
        <div>
          <label style={S.label}>Source type</label>
          <select
            style={{ ...S.input, height: 40 }}
            value={sourceType}
            onChange={e => setSourceType(e.target.value)}
          >
            <option value="manual">manual</option>
            <option value="session">session</option>
            <option value="call_summary">call_summary</option>
            <option value="script">script</option>
            <option value="compliance">compliance</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={S.label}>Content — this is what Lauren reads</label>
        <textarea
          style={S.textarea}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write exactly what Lauren should know or say in this situation. Be specific. Use Nathan's language."
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onSave({ ...initial, topic, title, content, source_type: sourceType })}
          disabled={saving || !content.trim()}
          style={{ ...S.btnGold, opacity: saving || !content.trim() ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : initial.id ? 'Save changes' : 'Add to knowledge base'}
        </button>
        <button onClick={onCancel} style={S.btnGhost}>Cancel</button>
      </div>
    </div>
  );
}

// ── Sessions tab ───────────────────────────────────────────────────────────────

function SessionsTab({ onAddKnowledge }: { onAddKnowledge: (draft: Partial<KnowledgeEntry>) => void }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'homeowner' | 'internal'>('homeowner');
  const [selected, setSelected] = useState<Session | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = filter !== 'all' ? `?type=${filter}` : '';
    const res = await fetch(`/api/admin/sessions${params}`);
    const data = await res.json();
    setSessions(data.sessions || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {selected && (
        <SessionPanel
          session={selected}
          onClose={() => setSelected(null)}
          onAddKnowledge={(draft) => { setSelected(null); onAddKnowledge(draft); }}
        />
      )}

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {(['all', 'homeowner', 'internal'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', fontSize: 12, fontWeight: 600,
              borderRadius: 20, border: '1px solid var(--border)',
              background: filter === f ? 'var(--gold)' : 'transparent',
              color: filter === f ? 'var(--bg)' : 'var(--cream-45)',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            {f}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--cream-20)' }}>
          {sessions.length} sessions
        </span>
      </div>

      {loading ? (
        <div style={{ color: 'var(--cream-45)', fontSize: 13, padding: '20px 0' }}>Loading…</div>
      ) : sessions.length === 0 ? (
        <div style={{ color: 'var(--cream-45)', fontSize: 13, padding: '20px 0' }}>No sessions found.</div>
      ) : (
        sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelected(s)}
            style={{
              ...S.card,
              transition: 'border-color .15s, background .15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,162,74,.3)';
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,162,74,.03)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,.02)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={S.badge(s.session_type)}>{s.session_type}</span>
                {s.deal_id && (
                  <span style={{ fontSize: 11, color: 'var(--cream-45)', fontFamily: 'var(--mono)' }}>
                    deal #{s.deal_id.slice(0, 8)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--cream-20)', fontFamily: 'var(--mono)' }}>
                {new Date(s.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {' · '}{s.msg_count} msgs
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--cream-70)', lineHeight: 1.5 }}>
              {s.preview}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Knowledge tab ──────────────────────────────────────────────────────────────

function KnowledgeTab({ pendingDraft, onDraftConsumed }: {
  pendingDraft: Partial<KnowledgeEntry> | null;
  onDraftConsumed: () => void;
}) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<KnowledgeEntry | null>(null);
  const [formDraft, setFormDraft] = useState<Partial<KnowledgeEntry>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/knowledge');
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Open form when a draft arrives from session panel
  useEffect(() => {
    if (pendingDraft) {
      setFormDraft(pendingDraft);
      setShowForm(true);
      setEditEntry(null);
      onDraftConsumed();
    }
  }, [pendingDraft, onDraftConsumed]);

  async function handleSave(data: Partial<KnowledgeEntry>) {
    setSaving(true);
    try {
      if (editEntry) {
        const res = await fetch('/api/admin/knowledge', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editEntry.id, ...data }),
        });
        const j = await res.json();
        setEntries(prev => prev.map(e => e.id === editEntry.id ? j.entry : e));
      } else {
        const res = await fetch('/api/admin/knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const j = await res.json();
        setEntries(prev => [j.entry, ...prev]);
      }
      setShowForm(false);
      setEditEntry(null);
      setFormDraft({});
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this knowledge entry? Lauren won\'t be able to use it.')) return;
    await fetch('/api/admin/knowledge', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  const filtered = search
    ? entries.filter(e =>
        [e.topic, e.title, e.content].some(f =>
          f?.toLowerCase().includes(search.toLowerCase())
        )
      )
    : entries;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input
          style={{ ...S.input, maxWidth: 280 }}
          placeholder="Search topic, title, content…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--cream-20)' }}>{filtered.length} entries</span>
        <button
          onClick={() => { setShowForm(true); setEditEntry(null); setFormDraft({}); }}
          style={S.btnGold}
        >
          + New entry
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <KnowledgeForm
          initial={editEntry ?? formDraft}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditEntry(null); setFormDraft({}); }}
          saving={saving}
        />
      )}

      {/* List */}
      {loading ? (
        <div style={{ color: 'var(--cream-45)', fontSize: 13, padding: '20px 0' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: 'var(--cream-45)', fontSize: 13, padding: '20px 0' }}>No entries found.</div>
      ) : (
        filtered.map(entry => (
          <div
            key={entry.id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '16px 20px',
              marginBottom: 10,
              background: editEntry?.id === entry.id ? 'rgba(201,162,74,.04)' : 'rgba(255,255,255,.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {entry.topic && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                    textTransform: 'uppercase', padding: '2px 8px', borderRadius: 12,
                    background: 'rgba(201,162,74,.1)', color: 'var(--gold)',
                    border: '1px solid rgba(201,162,74,.25)',
                  }}>{entry.topic}</span>
                )}
                {entry.source_type && entry.source_type !== 'manual' && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
                    textTransform: 'uppercase', padding: '2px 8px', borderRadius: 12,
                    background: 'rgba(255,255,255,.05)', color: 'var(--cream-45)',
                    border: '1px solid var(--border)',
                  }}>{entry.source_type}</span>
                )}
                {entry.title && (
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)' }}>
                    {entry.title}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                <button
                  onClick={() => {
                    setEditEntry(entry);
                    setFormDraft({});
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ ...S.btnGhost, padding: '5px 12px', fontSize: 12 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  style={{ ...S.btnDanger, padding: '5px 12px', fontSize: 12 }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div style={{
              fontSize: 13, color: 'var(--cream-45)', lineHeight: 1.6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              maxHeight: 96, overflow: 'hidden',
              maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)',
            }}>
              {entry.content}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--cream-20)' }}>
              Added {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────

export default function TrainClient() {
  const [tab, setTab] = useState<'sessions' | 'knowledge'>('sessions');
  const [pendingDraft, setPendingDraft] = useState<Partial<KnowledgeEntry> | null>(null);

  function handleAddKnowledge(draft: Partial<KnowledgeEntry>) {
    setPendingDraft(draft);
    setTab('knowledge');
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-.02em', color: 'var(--cream)' }}>
            RefundLocators
          </span>
          <span style={{ color: 'var(--border)', fontSize: 14 }}>·</span>
          <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>Lauren Trainer</span>
        </div>
        <button onClick={logout} style={{ ...S.btnGhost, padding: '5px 14px', fontSize: 12 }}>
          Sign out
        </button>
      </nav>

      <div style={S.body}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', margin: '0 0 6px', color: 'var(--cream)' }}>
            Train Lauren
          </h1>
          <p style={{ fontSize: 13, color: 'var(--cream-45)', margin: 0 }}>
            Read real conversations, then add knowledge entries so Lauren handles them better next time.
          </p>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          <button style={S.tab(tab === 'sessions')} onClick={() => setTab('sessions')}>
            Sessions
          </button>
          <button style={S.tab(tab === 'knowledge')} onClick={() => setTab('knowledge')}>
            Knowledge Base
          </button>
        </div>

        {/* Content */}
        {tab === 'sessions' && (
          <SessionsTab onAddKnowledge={handleAddKnowledge} />
        )}
        {tab === 'knowledge' && (
          <KnowledgeTab
            pendingDraft={pendingDraft}
            onDraftConsumed={() => setPendingDraft(null)}
          />
        )}
      </div>
    </div>
  );
}
