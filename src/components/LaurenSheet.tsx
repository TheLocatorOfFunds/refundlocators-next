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
  open, onClose, token,
}: {
  open: boolean;
  onClose: () => void;
  /** When omitted, Lauren acts as a general Ohio surplus-funds expert. */
  token?: LaurenTokenContext;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Greeting differs by mode
  const greeting = token
    ? `Hi ${token.firstName || 'there'}, I'm Lauren. I handle surplus funds cases like yours at ${token.propertyAddress}. What's on your mind?`
    : `Hi, I'm Lauren — RefundLocators' AI surplus-funds agent. I've read every Ohio foreclosure case in the public record, and I know Ohio surplus law cold. Ask me anything: how the process works, what to expect, your specific scenario. What's on your mind?`;

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: greeting }]);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
    if (!open) {
      setMessages([]);
      setInput('');
      setThinking(false);
      setSessionId(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollTop = endRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || thinking) return;

    const userMsg: ChatMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setThinking(true);

    try {
      const res = await fetch(CONFIG.LAUREN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          session_id: sessionId,
          ...(personalizationContext ? { personalization_context: personalizationContext } : {}),
        }),
      });
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);
      const reply = (data.reply || '').trim()
        || `Sorry — I'm having a hiccup on my end. You can text our team at (513) 516-2306 and we'll get right back to you.`;
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...next, {
        role: 'assistant',
        content: `Sorry — I'm having a hiccup on my end. You can text our team at (513) 516-2306 and we'll get right back to you.`,
      }]);
    } finally {
      setThinking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
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
    <div className="la-scrim" role="dialog" aria-modal="true" aria-label="Chat with Lauren">
      <div className="la-sheet">
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
            placeholder="Ask Lauren anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={thinking}
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
