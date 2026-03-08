"use client";

import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/subscribe';

export function SubscribeNavbar() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const res = await subscribeToNewsletter(email);

    if (res.error) {
      setStatus('error');
      setMessage(res.error);
    } else {
      setStatus('success');
      setMessage('Thanks! Love your support!');
      setEmail('');
      setTimeout(() => {
        setIsExpanded(false);
        setStatus('idle');
      }, 3000);
    }
  };

  if (status === 'success') {
    return <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>;
  }

  if (!isExpanded) {
    return (
      <button onClick={() => setIsExpanded(true)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 500 }}>
        Subscribe
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input 
          type="email" 
          placeholder="Email for Newsletter..." 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-main)', width: '200px' }}
        />
        <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '20px' }}>
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && <span style={{ color: 'var(--feedback-error)', position: 'absolute', top: '100%', left: 0, fontSize: '0.75rem', marginTop: '4px', whiteSpace: 'nowrap' }}>{message}</span>}
    </div>
  );
}
