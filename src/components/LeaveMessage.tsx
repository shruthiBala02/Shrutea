"use client";

import { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';
import { leaveMessage } from '@/app/actions/messages';

export function LeaveMessage() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setStatus('loading');
        const res = await leaveMessage(message);

        if (res.error) {
            setStatus('error');
            setFeedback(res.error);
        } else {
            setStatus('success');
            setFeedback('Message sent! Shruthi will see this in her studio. ✨');
            setMessage('');
            setTimeout(() => {
                setIsOpen(false);
                setStatus('idle');
            }, 3000);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="nav-message-btn"
                title="Leave a message for Shruthi!"
            >
                <Mail size={20} />
                <span className="nav-message-text">Leave a message!</span>
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '450px', position: 'relative' }}>
                        <button className="modal-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>

                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Mail className="gradient-text" />
                            Leave a Message
                        </h3>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Have something to say? A thought, a question, or just a hello?
                            Leave a note here—only I can see it in my Studio.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <textarea
                                className="modern-textarea"
                                placeholder="What's on your mind? (1 msg per day)"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={4}
                                style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.4)' }}
                            />

                            {status === 'success' ? (
                                <div style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center', padding: '0.5rem' }}>
                                    {feedback}
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={status === 'loading'}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        {status === 'loading' ? 'Sending...' : (
                                            <>
                                                <Send size={18} /> Send Message
                                            </>
                                        )}
                                    </button>
                                    {status === 'error' && (
                                        <p style={{ color: 'var(--feedback-error)', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center' }}>
                                            {feedback}
                                        </p>
                                    )}
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .nav-message-btn {
          background: none;
          border: none;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-message-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--accent-color);
        }
        .nav-message-text {
          display: none;
        }
        @media (min-width: 640px) {
          .nav-message-text {
            display: inline;
          }
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }
        .modal-content {
          width: 100%;
          padding: 2.5rem;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
        }
        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .modal-close:hover {
          color: #fff;
        }
      `}</style>
        </>
    );
}
