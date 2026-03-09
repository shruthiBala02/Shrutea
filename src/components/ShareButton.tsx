'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
    blogId: string;
    title: string;
}

export function ShareButton({ blogId, title }: ShareButtonProps) {
    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const url = `${window.location.origin}/blog/${blogId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Shrutea: ${title}`,
                    url: url
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(url);
                alert('Link copied to clipboard! 🥂');
            } catch (err) {
                console.error('Failed to copy extra link:', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="stats-btn"
            title="Share Post"
        >
            <Share2 size={14} />
        </button>
    );
}
