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
    if (hasLiked || !email || !email.includes('@')) {
      if (!email) setErrorStatus("Please enter your email to like!");
      return;
    }
    
    setLikes(l => l + 1);
    setHasLiked(true);
    setErrorStatus(null);
    
    const res = await likePost(blogId, email);
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
    <div className="interactions-container" style={{ borderTopColor: themeColor ? `${themeColor}44` : 'rgba(255,255,255,0.1)' }}>
      
      {/* Identity Recognition */}
      <div className="identifier-section">
        <p className="input-label" style={{ marginBottom: "0.5rem" }}>
          Tell us who you are (used for likes and comments)
        </p>
        
        {errorStatus && (
          <div style={{ padding: "0.8rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-sm)", color: "#f87171", fontSize: "0.9rem", marginBottom: "1rem" }}>
            {errorStatus}
          </div>
        )}
        
        <input 
          type="email" 
          placeholder="yourname@gmail.com" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="modern-input"
        />
      </div>

      {/* Main Interaction Bar */}
      <div className="interaction-bar">
        <button 
          onClick={handleLike}
          disabled={!email || hasLiked}
          className={`interaction-btn ${hasLiked ? 'active' : ''}`}
          style={{ 
            color: hasLiked ? (themeColor || "var(--accent-color)") : "#fff",
            borderColor: hasLiked ? (themeColor ? `${themeColor}66` : "var(--accent-color)") : "rgba(255,255,255,0.1)"
          }}
        >
          <Heart size={20} fill={hasLiked ? "currentColor" : "none"} /> 
          <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className={`interaction-btn ${showComments ? 'active' : ''}`}
        >
          <MessageCircle size={20} /> 
          <span>{comments.length} Comments</span>
        </button>
      </div>

      {/* Discussion Panel */}
      {showComments && (
        <div className="comments-panel">
          <h3 className="panel-title">
            <MessageCircle size={22} className="gradient-text" />
            Discussion
          </h3>
          
          <form onSubmit={submitComment} className="comment-form">
            <div className="textarea-wrapper">
              <textarea 
                placeholder="Write a comment..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                className="modern-textarea"
              />
              <button 
                type="submit" 
                disabled={commenting || !newComment || !email}
                className="submit-comment-btn"
                title="Post Comment"
              >
                <Send size={18} />
              </button>
            </div>
            {!email && (
              <p style={{ fontSize: "0.75rem", color: "rgba(239, 68, 68, 0.7)", textAlign: "center" }}>
                Enter your email above to enable commenting.
              </p>
            )}
          </form>

          <div className="comment-list">
            {comments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)" }}>
                <p>No comments yet. Be the first to start the conversation!</p>
              </div>
            ) : (
              [...comments].reverse().map((c: any) => (
                <div key={c.id} className="comment-bubble">
                  <div className="comment-header">
                    <div className="author-avatar" style={{ background: themeColor || "var(--accent-gradient)" }}>
                      {c.author_name?.charAt(0) || '?'}
                    </div>
                    <div className="author-info">
                      <span className="author-name">{c.author_name}</span>
                      {c.author_email && (
                        <span className="author-email-tag">{c.author_email}</span>
                      )}
                    </div>
                  </div>
                  <div className="comment-content">
                    {c.content}
                  </div>
                  <div className="comment-footer">
                    {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}
