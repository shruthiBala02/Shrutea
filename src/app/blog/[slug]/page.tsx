import Link from "next/link";
import { getBlogBySlug, getBlogComments } from "../../actions/blogs";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { PostInteractions } from "@/components/PostInteractions";
import { ViewCounter } from "@/components/ViewCounter";
import { calculateReadTime } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) return {};

  const title = `${blog.title} | Shrutea.`;
  const description = blog.content.replace(/<[^>]*>?/gm, '').substring(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [blog.image_url || '/logo_nav.png'],
      type: 'article',
      publishedTime: blog.created_at,
      authors: ['Shruthi B'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [blog.image_url || '/logo_nav.png'],
    }
  };
}

export const revalidate = 60;

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const comments = await getBlogComments(blog.id);
  const readTime = calculateReadTime(blog.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.image_url || '',
    "datePublished": blog.created_at,
    "author": {
      "@type": "Person",
      "name": "Shruthi B",
      "url": "https://linkedin.com/in/shruthibalasubramanian"
    },
    "description": blog.content.replace(/<[^>]*>?/gm, '').substring(0, 200)
  };

  return (
    <article style={{ background: '#050505', minHeight: "100vh", paddingTop: "var(--space-md)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container">
        <ViewCounter blogId={blog.id} />
        <Link href="/" style={{ color: "var(--accent-color)", fontWeight: 500, fontSize: "0.9rem", display: "inline-block", marginBottom: "var(--space-md)" }}>
          &larr; Back to home
        </Link>

        <div className="blog-reader-card" style={{
          padding: "clamp(1.5rem, 5vw, 2.5rem)",
          background: blog.theme_color ? `${blog.theme_color}4d` : 'rgba(255,255,255,0.08)',
          border: 'none',
          boxShadow: 'none',
          backdropFilter: "none",
          borderRadius: "var(--radius-lg)"
        }}>
          <header style={{ marginBottom: "var(--space-md)" }}>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", marginBottom: "var(--space-xs)", color: "#fff", lineHeight: "1.2" }}>{blog.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", color: "rgba(255,255,255,0.7)", flexWrap: "wrap", fontSize: "0.85rem" }}>
              <span style={{ fontStyle: "italic", fontWeight: 500 }}>With love, by Shruthi</span>
              <span>•</span>
              <span>{format(new Date(blog.created_at), 'MMMM d, yyyy')}</span>
              <span>•</span>
              <span style={{ color: "var(--accent-color)", fontWeight: 600 }}>{readTime}</span>
            </div>
          </header>

          {blog.image_url && (
            <div style={{ marginBottom: "var(--space-lg)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
              <img
                src={blog.image_url}
                alt={blog.title}
                style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
              />
            </div>
          )}

          {/* Render the raw HTML from TipTap */}
          <div
            className="blog-content"
            style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.95)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "var(--space-sm)", wordWrap: "break-word" }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Interactions (Likes, Comments) - Moved INSIDE the card */}
          <div style={{ marginTop: "4rem" }}>
            <PostInteractions
              blogId={blog.id}
              initialLikes={blog.likes_count || 0}
              initialComments={comments || []}
              themeColor={blog.theme_color}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
