import Link from "next/link";
import { getPublishedBlogs, getSiteSettings } from "./actions/blogs";
import { format } from "date-fns";
import { Heart, MessageCircle, Share2, Eye, Clock } from "lucide-react";
import { AboutMe } from "@/components/AboutMe";
import { calculateReadTime } from "@/lib/utils";
import { LikeButton } from "@/components/LikeButton";
import { ShareButton } from "@/components/ShareButton";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const blogs = await getPublishedBlogs();
  const settings = await getSiteSettings();

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      <div className="home-grid">
        <section className="feed-section">
          <h2 className="section-title" style={{ marginBottom: "var(--space-xl)", fontSize: "2rem" }}>Latest Posts</h2>

          <div className="blog-feed">
            {blogs.length === 0 ? (
              <div className="card" style={{ padding: "var(--space-2xl)", textAlign: "center", color: "var(--text-muted)" }}>
                No blogs published yet. Check back soon!
              </div>
            ) : (
              blogs.map((blog: any) => (
                <div
                  key={blog.id}
                  className="card blog-card-row"
                  style={{
                    background: blog.theme_color ? `${blog.theme_color}26` : 'var(--bg-card)',
                    borderColor: blog.theme_color ? `${blog.theme_color}80` : 'var(--border-color)',
                    boxShadow: blog.theme_color ? `0 0 30px ${blog.theme_color}1a` : 'none'
                  }}
                >
                  {blog.image_url ? (
                    <div className="blog-card-thumbnail" style={{ backgroundImage: `url('${blog.image_url}')` }}></div>
                  ) : null}

                  <div className="blog-card-main">
                    <Link href={`/blog/${blog.id}`} className="blog-card-link">
                      <h3 className="blog-title-text">{blog.title}</h3>
                      <p className="blog-excerpt-text">
                        {blog.content.replace(/<[^>]+>/g, '')}...
                      </p>
                    </Link>

                    <div className="blog-card-actions">
                      <span className="blog-card-date">{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                      <span className="stats-btn" style={{ cursor: 'default' }}>
                        <Clock size={12} /> <span style={{ fontSize: '0.75rem' }}>{calculateReadTime(blog.content)}</span>
                      </span>
                      <div className="blog-card-stats">
                        <LikeButton blogId={blog.id} initialLikes={blog.likes_count || 0} />
                        <Link href={`/blog/${blog.id}#comments`} className="stats-btn" title="Comment">
                          <MessageCircle size={14} /> <span>0</span>
                        </Link>
                        <span className="stats-btn" title="Views" style={{ cursor: 'default' }}>
                          <Eye size={14} /> <span>{blog.views_count || 0}</span>
                        </span>
                        <ShareButton blogId={blog.id} title={blog.title} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* About Me Section (Collapsible on Mobile) */}
        <section className="about-column">
          <AboutMe settings={settings} />
        </section>
      </div>
    </div>
  );
}
