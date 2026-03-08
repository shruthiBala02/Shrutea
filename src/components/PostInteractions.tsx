'use client'

import { useState } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { addComment, likePost } from '@/app/actions/interactions';

export function PostInteractions({ 
  blogId, 
  initialLikes, 
  initialComments, 
  themeColor 
}: { 
  blogId: string, 
  initialLikes: number, 
  initialComments: any[],
  themeColor?: string 
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [email, setEmail] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleLike = async () => {
    if (hasLiked) return;
    setLikes(l => l + 1);
    setHasLiked(true);
    const res = await likePost(blogId);
    if (res?.error) {
      setLikes(l => l - 1);
      setHasLiked(false);
      setErrorStatus(res.error);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment || !email) return;
    
    setCommenting(true);
    setErrorStatus(null);
    
    const optimisticComment = {
      id: Math.random().toString(),
      author_name: email.split('@')[0],
      content: newComment,
      created_at: new Date().toISOString()
    };
    
    // Save previous state for rollback
    const previousComments = [...comments];
    setComments([...comments, optimisticComment]);
    
    const res = await addComment(blogId, email, newComment);
    
    if (res?.error) {
      setComments(previousComments);
      setErrorStatus(res.error);
      setCommenting(false);
    } else {
      setNewComment('');
      setCommenting(false);
    }
  };

  return (
    <div style={{ marginTop: "3rem", borderTop: `1px solid ${themeColor ? `${themeColor}66` : 'rgba(255,255,255,0.1)'}`, paddingTop: "2rem" }}>
      
      {/* Interaction Bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: showComments ? "2rem" : "0" }}>
        <button 
          onClick={handleLike}
          className="btn-secondary" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            color: hasLiked ? (themeColor || "var(--accent-color)") : "#fff", 
            background: hasLiked ? `${themeColor || "var(--accent-color)"}26` : "rgba(255,255,255,0.05)",
            borderColor: hasLiked ? (themeColor || "var(--accent-color)") : "rgba(255,255,255,0.2)",
            padding: "0.7rem 1.2rem",
            fontSize: "1rem"
          }}
        >
          <Heart size={20} fill={hasLiked ? "currentColor" : "none"} /> 
          <span style={{ fontWeight: 600 }}>{likes}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="btn-secondary" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            background: showComments ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
            color: "#fff",
            borderColor: "rgba(255,255,255,0.2)",
            padding: "0.7rem 1.2rem",
            fontSize: "1rem"
          }}
        >
          <MessageCircle size={20} /> 
          <span style={{ fontWeight: 600 }}>{comments.length} Comments</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ background: "rgba(0, 0, 0, 0.2)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,255,255,0.1)", marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Discussion</h3>
          
          <form onSubmit={submitComment} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "-0.5rem" }}>Login with email or Google to comment</p>
            
            {errorStatus && (
              <div style={{ padding: "0.8rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-sm)", color: "#f87171", fontSize: "0.9rem" }}>
                {errorStatus}
              </div>
            )}
            <input 
              type="email" 
              placeholder="Your email address..." 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "0.8rem", borderRadius: "var(--radius-sm)" }}
            />
            <div style={{ position: "relative" }}>
              <textarea 
                placeholder="What are your thoughts?" 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                rows={3}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", width: "100%", padding: "0.8rem", paddingRight: "3rem", resize: "vertical", color: "#fff", borderRadius: "var(--radius-sm)" }}
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
