'use client';

/**
 * LaurenSheet — bottom-up chat sheet, used by both the homepage
 * (no token, general Q&A) and the personalized /s/[token] page
 * (token-aware, knows the visitor's case).
 *
 * Posts to CONFIG.LAUREN_URL with optional personalization_context.
 */

import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '@/lib/config';

/** Persistent per-browser id so the LAUREN_URL endpoint can stitch sessions. */
function getVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = localStorage.getItem('lauren_visitor_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('lauren_visitor_id', id); }
  return id;
}

export interface LaurenTokenContext {
  firstName?: string;
  lastName?: string;
  propertyAddress: string;
  county: string;
  caseNumber: string;
  saleDate: string;
  salePrice: number;
  judgmentAmount: number;
  estimatedLow: number;
  estimatedHigh: number;
  confirmed: boolean;
  confirmedAmount?: number | null;
}

interface ChatMsg { role: 'user' | 'assistant'; content: string }

export default function LaurenSheet({
  open, onClose, token, seed,
}: {
  open: boolean;
  onClose: () => void;
  /** When omitted, Lauren acts as a general Ohio surplus-funds expert. */
  token?: LaurenTokenContext;
  /** Optional first user message — auto-sent right after the greeting.
      Used by the homepage when an address search comes back inconclusive
      and we want Lauren to pick up the case in conversation. */
  seed?: string;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  // Ref-based concurrency lock — survives stale closures the way the
  // `thinking` state alone doesn't, so a hung request can't permanently
  // wedge the send button.
  const inFlightRef = useRef(false);
  const sessionRef = useRef<string | null>(null);
  // Mirror messages into a ref so async send() can read the latest list
  // without relying on closures that capture stale state.
  const messagesRef = useRef<ChatMsg[]>([]);
  // Persistent conversation row id, returned by /api/lauren/log on first call
  // and reused for subsequent updates.
  const conversationIdRef = useRef<string | null>(null);
  const logTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Mobile-keyboard + body-scroll lock ───────────────────────────────
  // We do two different things depending on whether we're on a phone or
  // a desktop, since they have different failure modes:
  //  - Mobile: iOS Safari shrinks visualViewport when the keyboard
  //    appears; we resize the sheet to fit above the keyboard so the
  //    input stays visible.
  //  - Desktop: the sheet is a centered modal sized by CSS; we just lock
  //    body scroll so the page underneath can't drift, and compensate
  //    for the scrollbar disappearance so the page doesn't shift.
  useEffect(() => {
    if (!open) return;

    const isMobile = window.matchMedia('(max-width: 719px)').matches;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const previous = {
      overflow:  document.body.style.overflow,
      position:  document.body.style.position,
      top:       document.body.style.top,
      width:     document.body.style.width,
      paddingR:  document.body.style.paddingRight,
    };

    document.body.style.overflow = 'hidden';
    if (isMobile) {
      // Hard lock: prevents iOS rubber-banding behind the sheet.
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else if (scrollbarWidth > 0) {
      // Desktop: keep the scrollbar gutter so the page doesn't jump
      // sideways when overflow:hidden hides the scrollbar.
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    let cleanup: (() => void) | undefined;
    if (isMobile) {
      const vv = window.visualViewport;
      const updateHeight = () => {
        const sheet = sheetRef.current;
        if (!sheet) return;
        const h = vv?.height ?? window.innerHeight;
        sheet.style.height = `${h}px`;
        if (endRef.current) {
          endRef.current.scrollTop = endRef.current.scrollHeight;
        }
      };
      updateHeight();
      vv?.addEventListener('resize', updateHeight);
      vv?.addEventListener('scroll', updateHeight);
      cleanup = () => {
        vv?.removeEventListener('resize', updateHeight);
        vv?.removeEventListener('scroll', updateHeight);
      };
    }
    // Desktop: do nothing — let CSS size the sheet via min(720px, 92dvh).

    return () => {
      cleanup?.();
      document.body.style.overflow = previous.overflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      document.body.style.paddingRight = previous.paddingR;
      if (isMobile) window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Build personalization_context only when we have a token
  const personalizationContext = token
    ? (() => {
        const amt = token.confirmed
          ? `$${(token.confirmedAmount ?? 0).toLocaleString('en-US')} (confirmed by the court)`
          : `roughly $${token.estimatedLow.toLocaleString('en-US')}–$${token.estimatedHigh.toLocaleString('en-US')} (estimated from court records)`;
        return [
          `Person: ${[token.firstName, token.lastName].filter(Boolean).join(' ') || 'Former Ohio homeowner'}`,
          `Property: ${token.propertyAddress}, ${token.county} County OH`,
          `Case number: ${token.caseNumber}`,
          `Sold at sheriff's sale: ${token.saleDate} for $${token.salePrice.toLocaleString('en-US')}`,
          `Judgment debt paid off: $${token.judgmentAmount.toLocaleString('en-US')}`,
          `Their surplus: ${amt}`,
          `Money is held by the ${token.county} County Clerk of Courts.`,
        ].join('\n');
      })()
    : undefined;

  // Greeting differs by mode. Generic mode used to lead with "AI surplus-funds
  // agent" — the competitive research found that framing makes scam-wary,
  // older audiences MORE anxious, not less. Same product, framed as a person
  // who knows the answer.
  const greeting = token
    ? `Hi ${token.firstName || 'there'}, I'm Lauren. I handle surplus funds cases like yours at ${token.propertyAddress}. What do you want to know?`
    : `Hi, I'm Lauren. I've read every Ohio foreclosure case in the public record, so I can give you a straight answer about your situation — how the process works, what to expect, whether your address has surplus, anything. What's on your mind?`;

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: greeting }]);
      const focusT = setTimeout(() => inputRef.current?.focus(), 350);
      // If a seed message is supplied, send it on the user's behalf so
      // Lauren picks up the conversation immediately with full context.
      let seedT: ReturnType<typeof setTimeout> | undefined;
      if (seed && seed.trim()) {
        seedT = setTimeout(() => { void send(seed); }, 600);
      }
      return () => { clearTimeout(focusT); if (seedT) clearTimeout(seedT); };
    }
    if (!open) {
      // One last log flush before we tear down — sendBeacon survives the
      // close even if the user is also navigating away.
      if (conversationIdRef.current && messagesRef.current.length > 0) {
        const blob = new Blob([JSON.stringify({
          conversation_id: conversationIdRef.current,
          visitor_id: getVisitorId(),
          transcript: messagesRef.current,
        })], { type: 'application/json' });
        try { navigator.sendBeacon('/api/lauren/log', blob); } catch { /* silent */ }
      }
      if (logTimerRef.current) { clearTimeout(logTimerRef.current); logTimerRef.current = null; }

      setMessages([]);
      setInput('');
      setThinking(false);
      setSessionId(null);
      // Reset all refs so a re-open starts clean.
      inFlightRef.current = false;
      sessionRef.current = null;
      conversationIdRef.current = null;
      messagesRef.current = [];
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesRef.current = messages;
    if (endRef.current) {
      endRef.current.scrollTop = endRef.current.scrollHeight;
    }

    // Debounced log write. Only fires when the chat actually has user
    // content (skip the auto-greeting alone). Fire-and-forget — if the
    // log endpoint is down or the table doesn't exist yet, we silently
    // ignore so the user's chat is never affected.
    if (!open) return;
    const hasUserContent = messages.some(m => m.role === 'user');
    if (!hasUserContent) return;

    if (logTimerRef.current) clearTimeout(logTimerRef.current);
    logTimerRef.current = setTimeout(() => {
      const body = {
        conversation_id: conversationIdRef.current,
        visitor_id: getVisitorId(),
        page_origin: typeof window !== 'undefined' ? window.location.pathname : null,
        token: token ? token.propertyAddress : null, // best-effort identifier
        seed_message: seed || null,
        transcript: messagesRef.current,
      };
      fetch('/api/lauren/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true, // survive page unload
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.id && !conversationIdRef.current) {
            conversationIdRef.current = data.id;
          }
        })
        .catch(() => { /* silent */ });
    }, 1500);
  }, [messages, thinking, open, seed, token]);

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    // Use the ref (not state) for the lock — refs see writes immediately
    // across closures, state doesn't until the next render.
    if (!text || inFlightRef.current) return;

    inFlightRef.current = true;
    setThinking(true);

    const userMsg: ChatMsg = { role: 'user', content: text };
    // Snapshot synchronously from the ref (always current), then push it
    // into both React state and the API request body.
    const snapshot: ChatMsg[] = [...messagesRef.current, userMsg];
    messagesRef.current = snapshot;
    setMessages(snapshot);
    setInput('');

    // 25 s hard ceiling — abort the request rather than leaving the user
    // staring at a dim send button forever.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    const finishWith = (replyContent: string) => {
      const next = [...messagesRef.current, { role: 'assistant' as const, content: replyContent }];
      messagesRef.current = next;
      setMessages(next);
    };

    try {
      const res = await fetch(CONFIG.LAUREN_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: snapshot,
          session_id: sessionRef.current,
          visitor_id: getVisitorId(),
          ...(personalizationContext ? { personalization_context: personalizationContext } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data && data.session_id) {
        sessionRef.current = data.session_id;
        setSessionId(data.session_id);
      }
      const reply = ((data && typeof data.reply === 'string') ? data.reply : '').trim()
        || `Sorry — I had trouble with that. You can text our team at (513) 516-2306 and we'll get right back to you.`;
      finishWith(reply);
    } catch (err) {
      const aborted = (err as Error)?.name === 'AbortError';
      finishWith(
        aborted
          ? `That took too long on my end. Try once more, or text our team at (513) 516-2306.`
          : `Sorry — I'm having a hiccup on my end. You can text our team at (513) 516-2306 and we'll get right back to you.`
      );
    } finally {
      clearTimeout(timeoutId);
      inFlightRef.current = false;
      setThinking(false);
      // Re-focus only when we still have the input mounted.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) return null;

  const showQuickReplies = messages.length === 1 && !thinking;
  const quickReplies = token
    ? [
        'Is this legit?',
        `What's the catch?`,
        'How long does it take?',
        'Who is the attorney?',
      ]
    : [
        `What's a surplus, exactly?`,
        'How long does recovery take?',
        `What's the fee?`,
        'How do I know my address has one?',
      ];

  return (
    <div
      className="la-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Chat with Lauren"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="la-sheet" ref={sheetRef}>
        <header className="la-header">
          <div className="la-header-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="la-avatar" src="/s-assets/lauren-cropped.png" alt="Lauren" />
            <div className="la-header-text">
              <div className="la-header-name">Lauren</div>
              <div className="la-header-sub">
                <span className="la-dot" aria-hidden="true" /> Surplus case agent · online
              </div>
            </div>
          </div>
          <button type="button" className="la-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="la-body" ref={endRef}>
          {messages.map((m, i) => (
            <div key={i} className={`la-msg la-msg-${m.role}`}>
              <div className="la-bubble">{m.content}</div>
            </div>
          ))}
          {thinking && (
            <div className="la-msg la-msg-assistant">
              <div className="la-bubble la-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          {showQuickReplies && (
            <div className="la-quick">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="la-quick-btn"
                  onClick={() => send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="la-inputbar">
          <input
            ref={inputRef}
            className="la-input"
            type="text"
            placeholder={thinking ? 'Lauren is typing…' : 'Ask Lauren anything…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            /* Intentionally NOT disabled while thinking — let the user
               type the next message in parallel. The send button gates
               actually sending. */
          />
          <button
            type="button"
            className="la-send"
            onClick={() => send()}
            disabled={!input.trim() || thinking}
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l12-6-4 14-3-6-5-2z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="la-foot">
          AI agent · trained on Ohio surplus funds law. For a human, text{' '}
          <a href="sms:+15135162306">(513) 516-2306</a>.
        </div>
      </div>
    </div>
  );
}
