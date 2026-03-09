'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function ImageLightbox() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName.toLowerCase() === 'img' && target.closest('.blog-content')) {
                const imgSrc = (target as HTMLImageElement).src;
                if (target.clientWidth > 100) {
                    setSelectedImage(imgSrc);
                }
            }
        };

        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <AnimatePresence>
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedImage(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(5, 5, 5, 0.95)',
                        zIndex: 100000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out',
                        padding: '2rem'
                    }}
                >
                    <button
                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        onClick={() => setSelectedImage(null)}
                        title="Close"
                    >
                        <X size={32} />
                    </button>
                    <motion.img
                        src={selectedImage}
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            maxHeight: '90vh',
                            maxWidth: '90vw',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
