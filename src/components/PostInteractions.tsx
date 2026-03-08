'use client'

import { useState } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { addComment, likePost } from '@/app/actions/interactions';

export function PostInteractions({ blogId, initialLikes, initialComments }: { blogId: string, initialLikes: number, initialComments: any[] }) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [email, setEmail] = useState('');
  const [commenting, setCommenting] = useState(false);

  const handleLike = async () => {
    if (hasLiked) return;
    setLikes(l => l + 1);
    setHasLiked(true);
    await likePost(blogId);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment || !email) return;
    
    setCommenting(true);
    
    // Fallback UI update
    const optimisticComment = {
      id: Math.random().toString(),
      author_name: email.split('@')[0],
      content: newComment,
      created_at: new Date().toISOString()
    };
    
    setComments([...comments, optimisticComment]);
    setNewComment('');
    setCommenting(false);
    
    await addComment(blogId, email, newComment);
  };

  return (
    <div style={{ marginTop: "var(--space-2xl)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-xl)" }}>
      
      {/* Interaction Bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "var(--space-xl)" }}>
        <button 
          onClick={handleLike}
          className="btn-secondary" 
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: hasLiked ? "var(--accent-color)" : "inherit", borderColor: hasLiked ? "var(--accent-color)" : "var(--border-color)" }}
        >
          <Heart size={18} fill={hasLiked ? "currentColor" : "none"} /> 
          <span>{likes}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="btn-secondary" 
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: showComments ? "var(--bg-hover)" : "transparent" }}
        >
          <MessageCircle size={18} /> 
          <span>{comments.length} Comments</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ background: "var(--bg-hover)", padding: "var(--space-lg)", borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Discussion</h3>
          
          <form onSubmit={submitComment} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "-0.5rem" }}>Login with email or Google to comment</p>
            <input 
              type="email" 
              placeholder="Your email address..." 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ background: "var(--bg-color)", border: "1px solid var(--border-color)" }}
            />
            <div style={{ position: "relative" }}>
              <textarea 
                placeholder="What are your thoughts?" 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                rows={3}
                style={{ background: "var(--bg-color)", border: "1px solid var(--border-color)", width: "100%", paddingRight: "3rem", resize: "vertical" }}
              />
              <button 
                type="submit" 
                disabled={commenting || !newComment || !email}
                className="btn-primary"
                style={{ position: "absolute", bottom: "1rem", right: "1rem", padding: "0.4rem" }}
              >
                <Send size={16} />
              </button>
            </div>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {comments.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "1rem 0" }}>Be the first to share your thoughts!</p>
            ) : (
              comments.map((c: any) => (
                <div key={c.id} style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-color)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.9rem" }}>
                      {c.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, display: "block", fontSize: "0.95rem" }}>{c.author_name}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-main)", fontSize: "0.95rem", lineHeight: "1.5" }}>{c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}
