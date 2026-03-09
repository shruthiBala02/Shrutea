'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { likePost } from '@/app/actions/interactions';

interface LikeButtonProps {
    blogId: string;
    initialLikes: number;
}

export function LikeButton({ blogId, initialLikes }: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiking, setIsLiking] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLiking || hasLiked) return;

        setIsLiking(true);
        try {
            const result = await likePost(blogId);
            if (result.success) {
                setLikes(prev => prev + 1);
                setHasLiked(true);
            } else if (result.error) {
                alert(result.error);
            }
        } catch (err) {
            console.error('Failed to like post:', err);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            className={`stats-btn ${hasLiked ? 'active' : ''}`}
            disabled={isLiking || hasLiked}
            title={hasLiked ? "Liked!" : "Like"}
            style={{
                color: hasLiked ? 'var(--accent-color)' : 'inherit',
                cursor: hasLiked ? 'default' : 'pointer'
            }}
        >
            <Heart size={14} fill={hasLiked ? "currentColor" : "none"} />
            <span>{likes}</span>
        </button>
    );
}
