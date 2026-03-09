'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Linkedin } from 'lucide-react';

export function HighlightToShare() {
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [text, setText] = useState('');

    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed) {
                setShow(false);
                return;
            }

            const selectedText = selection.toString().trim();
            if (selectedText.length < 10) {
                setShow(false);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setPosition({
                x: rect.left + rect.width / 2,
                y: rect.top + window.scrollY - 10,
            });
            setText(selectedText);
            setShow(true);
        };

        document.addEventListener('selectionchange', handleSelection);
        return () => document.removeEventListener('selectionchange', handleSelection);
    }, []);

    if (!show) return null;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const shareTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${text}"\n\n`)}&url=${encodeURIComponent(currentUrl)}`;
        window.open(url, '_blank');
        setShow(false);
        window.getSelection()?.removeAllRanges();
    };

    const shareLinkedin = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
        window.open(url, '_blank');
        setShow(false);
        window.getSelection()?.removeAllRanges();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -100%)',
                    zIndex: 9999,
                    display: 'flex',
                    gap: '8px',
                    background: '#061a30',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '1px solid #1a365d'
                }}
                className="highlight-share-bubble"
            >
                <button onClick={shareTwitter} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Share to Twitter">
                    <Twitter size={16} />
                </button>
                <button onClick={shareLinkedin} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Share to LinkedIn">
                    <Linkedin size={16} />
                </button>
                <div style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #061a30',
                }} />
            </motion.div>
        </AnimatePresence>
    );
}
