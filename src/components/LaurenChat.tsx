'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONFIG } from '@/lib/config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_GREETING = `Hi! I'm Lauren — the AI for RefundLocators.\n\nI can pull up your Ohio foreclosure case right now and tell you exactly what surplus the county may be holding for you. Just so you know, I'm an AI — Nathan built me to know every case. I hand off to him when things get complicated.\n\nWhat's your name?`;

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('lauren_visitor_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('lauren_visitor_id', id); }
  return id;
}

function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lauren_session_home');
}

function setSessionId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lauren_session_home', id);
}

export default function LaurenChat({
  personalizationContext,
  greeting,
}: {
  personalizationContext?: string;
  greeting?: string;
} = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [sessionId, setSession] = useState<string | null>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const greeted = useRef(false);

  useEffect(() => {
    setSession(getSessionId());
    if (!greeted.current) {
      greeted.current = true;
      const timer = setTimeout(() => {
        setMessages([{ role: 'assistant', content: greeting ?? DEFAULT_GREETING }]);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages, busy]);

  const send = useCallback(async () => {
    if (busy || !input.trim()) return;
    const text = input.trim();
    setInput('');

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setBusy(true);

    try {
      const res = await fetch(CONFIG.LAUREN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          session_id: sessionId,
          visitor_id: getVisitorId(),
          ...(personalizationContext ? { personalization_context: personalizationContext } : {}),
        }),
      });
      const data = await res.json();
      if (data.session_id) { setSessionId(data.session_id); setSession(data.session_id); }
      const reply = data.reply || "Sorry, I had trouble with that. Call Nathan directly at (513) 516-2306.";
      const assistantMsg: Message = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMsg]);
      setHistory(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having connection issues. Call Nathan at (513) 516-2306." }]);
    }
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [busy, input, history, sessionId]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
      style={{
        width: 'min(560px, 100%)',
        background: 'var(--glass)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-deep), 0 0 0 1px rgba(201,162,74,.07)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,.02)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #9a7a32, #c9a24a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 15, color: 'var(--bg)', flexShrink: 0,
        }}>L</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cream)' }}>Lauren</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--cream-45)', fontFamily: 'var(--mono)' }}>
              online · reading Ohio court records
            </span>
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--cream-45)',
          background: 'var(--glass)', border: '1px solid var(--border)',
          padding: '3px 9px', borderRadius: 'var(--r-pill)',
        }}>AI · RefundLocators</div>
      </div>

      {/* Messages */}
      <div
        ref={msgsRef}
        style={{
          minHeight: 200, maxHeight: 300, overflowY: 'auto',
          padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              style={{
                maxWidth: '88%',
                fontSize: 14, lineHeight: 1.6,
                borderRadius: 16,
                padding: '10px 14px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                ...(msg.role === 'assistant' ? {
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid var(--border)',
                  color: 'var(--cream)',
                  alignSelf: 'flex-start',
                  borderBottomLeftRadius: 4,
                } : {
                  background: 'var(--gold)',
                  color: 'var(--bg)',
                  fontWeight: 500,
                  alignSelf: 'flex-end',
                  borderBottomRightRadius: 4,
                }),
              }}
            >
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing dots */}
        <AnimatePresence>
          {busy && (
            <motion.div
              key="dots"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,.06)',
                border: '1px solid var(--border)',
                borderRadius: 16, borderBottomLeftRadius: 4,
                padding: '12px 16px', display: 'flex', gap: 5,
              }}
            >
              {[0, 0.2, 0.4].map((delay, i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--cream-45)',
                  display: 'block',
                  animation: `dot-bounce 1.2s ${delay}s infinite`,
                }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 14px',
        borderTop: '1px solid var(--border)',
        background: 'rgba(255,255,255,.02)',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="What's your name?"
          rows={1}
          disabled={busy}
          style={{
            flex: 1, background: 'rgba(255,255,255,.06)',
            border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
            padding: '10px 14px', font: '14px var(--font)',
            color: 'var(--cream)', outline: 'none', resize: 'none',
            minHeight: 42, lineHeight: 1.5, transition: 'border-color .15s, box-shadow .15s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--border-g)';
            e.target.style.boxShadow = '0 0 0 3px rgba(201,162,74,.14)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
          onInput={e => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = 'auto';
            t.style.height = Math.min(t.scrollHeight, 96) + 'px';
          }}
        />
        <motion.button
          onClick={send}
          disabled={busy || !input.trim()}
          whileTap={{ scale: 0.92 }}
          style={{
            width: 42, height: 42, flexShrink: 0, border: 'none',
            background: input.trim() && !busy ? 'var(--gold)' : 'rgba(201,162,74,.3)',
            color: 'var(--bg)', fontSize: 18, fontWeight: 700,
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: busy || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'background .15s',
          }}
        >
          ↑
        </motion.button>
      </div>
    </motion.div>
  );
}
