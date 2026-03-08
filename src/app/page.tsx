import Link from "next/link";
import { getPublishedBlogs, getSiteSettings } from "./actions/blogs";
import { format } from "date-fns";
import { Heart, MessageCircle, Share2, Eye, Instagram, Mail } from "lucide-react";

export const dynamic = 'force-dynamic'; // Force dynamic rendering to ensure live views/likes stats

export default async function Home() {
  const blogs = await getPublishedBlogs();
  const settings = await getSiteSettings();

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "4rem", alignItems: "start" }}>
        
        {/* Left Column: About Me (Sticky on Desktop) */}
        <section className="about-section" style={{ position: "sticky", top: "100px", flexShrink: 0 }}>
          <div className="card" style={{ padding: "var(--space-xl)", background: "linear-gradient(145deg, rgba(2, 132, 199, 0.3) 0%, rgba(12, 45, 85, 0.6) 50%, rgba(56, 189, 248, 0.25) 100%)", backdropFilter: "blur(12px)", border: "2px solid rgba(56, 189, 248, 0.5)", boxShadow: "0 0 50px rgba(56, 189, 248, 0.2)" }}>
            
            {settings?.profile_image_url && (
              <img 
                src={settings.profile_image_url} 
                alt="Shruthi B" 
                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%", border: "3px solid transparent", backgroundImage: "linear-gradient(#050505, #050505), var(--accent-gradient)", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box", marginBottom: "1.5rem" }} 
              />
            )}

            <h1 className="gradient-text" style={{ marginBottom: "1rem", fontSize: "2.8rem", letterSpacing: "-1px" }}>Hi!</h1>
            <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", fontWeight: 500, color: "var(--text-main)", lineHeight: "1.7" }}>
              I am Shruthi B. A Chennai girl, pursuing my Masters at IIT Madras. 
            </p>
            
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "var(--accent-color)" }}>What you can expect here:</h2>
            <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p>
                This is a small corner of the internet where I write about life as it unfolds. Sometimes it might be about something that inspired me, a piece of advice that stayed with me, or a research paper that made me pause and think. Other times it may simply be about appreciating the small things, celebrating a few moments, or even the occasional rant.
              </p>
              <p>
                I want this space to feel raw, beautiful, imperfect and wholesome, like something written honestly in the middle of living life. If you have watched the show Modern Family, you know how every episode leaves you with a small thought to carry with you. That is the feeling I hope these pieces have. Light enough to read mindlessly, yet meaningful enough to make you pause for a second.
              </p>
              <p>
                Mostly this will be about being human, being chaotic, imperfect, sometimes causing little hurricanes, and sometimes just quietly existing. I do not really know where this will go yet, but if you are here, travel with me on this journey and I will try my best to keep you hooked.
              </p>
            </div>

            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
              <h3 className="gradient-text" style={{ fontSize: "1.1rem", marginBottom: "0.25rem", fontWeight: 700 }}>Do you want to connect?</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>Here are my social handles:</p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <a href="https://instagram.com/10shruthi" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "0.5rem 1rem", flex: 1, justifyContent: "center", display: "flex", gap: "0.5rem" }}>
                  <Instagram size={18} /> Instagram
                </a>
                <a href="mailto:shruanalytics@gmail.com" className="btn-secondary" style={{ padding: "0.5rem 1rem", flex: 1, justifyContent: "center", display: "flex", gap: "0.5rem" }}>
                  <Mail size={18} /> Email
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Latest Posts */}
        <section className="feed-section">
          <h2 className="section-title" style={{ marginBottom: "var(--space-xl)", fontSize: "2rem" }}>Latest Posts</h2>
          
          <div className="blog-feed" style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
            {blogs.length === 0 ? (
              <div className="card" style={{ padding: "var(--space-2xl)", textAlign: "center", color: "var(--text-muted)" }}>
                No blogs published yet. Check back soon!
              </div>
            ) : (
              blogs.map((blog: any) => (
                <div key={blog.id} className="card" style={{ padding: "var(--space-lg)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "row", gap: "var(--space-lg)", background: blog.theme_color || 'rgba(6, 26, 48, 0.7)', alignItems: "center", minHeight: "180px" }}>
                  
                  {/* Left: Constant Rectangle Image */}
                  {blog.image_url ? (
                    <div style={{ width: "200px", height: "140px", flexShrink: 0, borderRadius: "var(--radius-sm)", backgroundImage: `url('${blog.image_url}')`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(255,255,255,0.1)" }}></div>
                  ) : null}

                  {/* Right: Content & Actions */}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%", justifyContent: "space-between" }}>
                    
                    {/* Body Link */}
                    <Link href={`/blog/${blog.id}`} style={{ display: "block" }}>
                      <h3 className="blog-title" style={{ fontSize: "1.6rem", marginBottom: "var(--space-xs)", lineHeight: "1.2", letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{blog.title}</h3>
                      <p className="blog-excerpt" style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "var(--space-sm)" }}>
                        {blog.content.replace(/<[^>]+>/g, '')}...
                      </p>
                    </Link>
                    
                    {/* Action Bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "var(--space-xs)", marginTop: "auto" }}>
                      <span className="blog-date" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                      <div style={{ display: "flex", gap: "1rem", color: "rgba(255,255,255,0.7)" }}>
                        <button style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "inherit", background: "none", border: "none", cursor: "pointer" }} title="Like">
                          <Heart size={14} /> <span style={{ fontSize: "0.8rem" }}>{blog.likes_count || 0}</span>
                        </button>
                        <button style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "inherit", background: "none", border: "none", cursor: "pointer" }} title="Comment">
                          <MessageCircle size={14} /> <span style={{ fontSize: "0.8rem" }}>0</span>
                        </button>
                        <button style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "inherit", background: "none", border: "none", cursor: "pointer" }} title="Views">
                          <Eye size={14} /> <span style={{ fontSize: "0.8rem" }}>{blog.views_count || 0}</span>
                        </button>
                        <button style={{ color: "inherit", background: "none", border: "none", cursor: "pointer" }} title="Share">
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
