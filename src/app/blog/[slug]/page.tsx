import Link from "next/link";
import { getBlogBySlug, getBlogComments } from "../../actions/blogs";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { PostInteractions } from "@/components/PostInteractions";
import { ViewCounter } from "@/components/ViewCounter";

export const revalidate = 60;

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const comments = await getBlogComments(blog.id);

  return (
    <article style={{ background: '#050505', minHeight: "100vh", paddingTop: "var(--space-xl)" }}>
      <div className="container">
        <ViewCounter blogId={blog.id} />
        <Link href="/" style={{ color: "var(--accent-color)", fontWeight: 500, fontSize: "0.9rem", display: "inline-block", marginBottom: "var(--space-md)" }}>
          &larr; Back to home
        </Link>
        
        <div className="blog-reader-card" style={{ 
          padding: "4rem",
          background: blog.theme_color ? `${blog.theme_color}4d` : 'rgba(255,255,255,0.08)', 
          border: `2px solid ${blog.theme_color || 'var(--accent-color)'}`,
          boxShadow: `0 0 50px ${blog.theme_color}33`,
          backdropFilter: "none" 
        }}>
          <header style={{ marginBottom: "var(--space-lg)" }}>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", marginBottom: "var(--space-sm)", color: "#fff", lineHeight: "1.1" }}>{blog.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", color: "rgba(255,255,255,0.7)", flexWrap: "wrap", fontSize: "0.95rem" }}>
              <span style={{ fontStyle: "italic", fontWeight: 500 }}>With love, by Shruthi</span>
              <span>•</span>
              <span>{format(new Date(blog.created_at), 'MMMM d, yyyy')}</span>
            </div>
          </header>

          {blog.image_url && (
            <div style={{ marginBottom: "var(--space-xl)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
              <img 
                src={blog.image_url} 
                alt={blog.title} 
                style={{ width: "100%", maxHeight: "700px", objectFit: "contain" }} 
              />
            </div>
          )}

          {/* Render the raw HTML from TipTap */}
          <div 
            className="blog-content"
            style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.95)", lineHeight: "1.8", display: "flex", flexDirection: "column", gap: "var(--space-md)", wordWrap: "break-word" }}
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />
        </div>

        {/* Interactions (Likes, Comments) */}
        <div style={{ marginTop: "var(--space-xl)", marginBottom: "var(--space-2xl)" }}>
          <PostInteractions 
            blogId={blog.id} 
            initialLikes={blog.likes_count || 0} 
            initialComments={comments || []} 
          />
        </div>
      </div>
    </article>
  );
}
