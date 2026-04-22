'use client';

import { useState, FormEvent } from 'react';
import { CONFIG } from '@/lib/config';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
  font: '15px var(--font)', color: 'var(--cream)',
  background: 'rgba(255,255,255,.04)', outline: 'none',
  transition: 'border-color .12s, box-shadow .12s', appearance: 'none',
};

export default function LeadForm({ counties }: { counties: string[] }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const r = await fetch(CONFIG.SUBMIT_LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'refundlocators.com' }),
      });
      if (r.ok) {
        setStatus('success');
        setMsg("We're on it — you'll get a text with what we find within minutes.");
        form.reset();
      } else {
        setStatus('error');
        setMsg('Something went wrong. Call Nathan directly at (513) 951-8855.');
      }
    } catch {
      setStatus('error');
      setMsg('Network error. Call Nathan directly at (513) 951-8855.');
    }
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border-g)';
    e.target.style.boxShadow = '0 0 0 3px rgba(201,162,74,.12)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '28px 24px' }}
    >
      {[
        { id: 'f-name', name: 'name', label: 'Your name', type: 'text', required: true, placeholder: 'First and last name', autoComplete: 'name' },
        { id: 'f-phone', name: 'phone', label: 'Phone', labelNote: '(we\'ll text you what we find)', type: 'tel', placeholder: '(555) 555-5555', autoComplete: 'tel' },
        { id: 'f-email', name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
        { id: 'f-address', name: 'address', label: 'Property address', labelNote: '(current or former)', type: 'text', placeholder: '123 Main St, Columbus OH', autoComplete: 'street-address' },
      ].map(field => (
        <div key={field.id} style={{ marginBottom: 14 }}>
          <label htmlFor={field.id} style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--cream-45)', marginBottom: 7 }}>
            {field.label}
            {field.labelNote && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--cream-20)', marginLeft: 4 }}>{field.labelNote}</span>}
          </label>
          <input
            id={field.id}
            name={field.name}
            type={field.type}
            required={field.required}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      ))}

      <div style={{ marginBottom: 14 }}>
        <label htmlFor="f-county" style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--cream-45)', marginBottom: 7 }}>County</label>
        <select
          id="f-county"
          name="county"
          style={{
            ...inputStyle,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a24a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
            colorScheme: 'dark',
          }}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <option value="">Select your county…</option>
          {counties.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 0 }}>
        <label htmlFor="f-case" style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--cream-45)', marginBottom: 7 }}>
          Case number <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--cream-20)' }}>(optional)</span>
        </label>
        <input id="f-case" name="case_number" type="text" placeholder="e.g. 2023 CV 12345" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          width: '100%', minHeight: 50, marginTop: 18,
          background: 'var(--gold)', color: 'var(--bg)',
          border: 'none', borderRadius: 'var(--r-md)',
          font: '700 15px var(--font)', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          boxShadow: 'var(--shadow-gold)', transition: 'background .12s, transform .08s',
          opacity: status === 'loading' ? 0.7 : 1,
        }}
      >
        {status === 'loading' ? 'Checking…' : 'Find my money →'}
      </button>

      {msg && (
        <div style={{
          marginTop: 14, padding: '12px 14px', borderRadius: 'var(--r-sm)',
          fontSize: 14, fontWeight: 500,
          ...(status === 'success'
            ? { background: 'rgba(34,197,94,.12)', color: '#86efac', border: '1px solid rgba(34,197,94,.25)' }
            : { background: 'rgba(239,68,68,.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.25)' }
          ),
        }}>{msg}</div>
      )}

      <p style={{ fontSize: 11, color: 'var(--cream-20)', lineHeight: 1.6, marginTop: 14 }}>
        By submitting, you agree to receive SMS and email from FundLocators LLC about your case. Standard rates apply. Reply STOP to opt out.
      </p>
    </form>
  );
}
