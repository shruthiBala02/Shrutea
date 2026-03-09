import Link from "next/link";
import { getPublishedBlogs, getSiteSettings } from "./actions/blogs";
import { format } from "date-fns";
import { Heart, MessageCircle, Share2, Eye, Clock } from "lucide-react";
import { AboutMe } from "@/components/AboutMe";
import { calculateReadTime } from "@/lib/utils";

export const dynamic = 'force-dynamic'; // Force dynamic rendering to ensure live views/likes stats

export default async function Home() {
  const blogs = await getPublishedBlogs();
  const settings = await getSiteSettings();

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      <div className="home-grid">
        {/* Blog Feed Section (Priority on Mobile) */}
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
                  {/* Left: Constant Rectangle Image */}
                  {blog.image_url ? (
                    <div className="blog-card-thumbnail" style={{ backgroundImage: `url('${blog.image_url}')` }}></div>
                  ) : null}

                  {/* Right: Content & Actions */}
                  <div className="blog-card-main">
                    {/* Body Link */}
                    <Link href={`/blog/${blog.id}`} className="blog-card-link">
                      <h3 className="blog-title-text">{blog.title}</h3>
                      <p className="blog-excerpt-text">
                        {blog.content.replace(/<[^>]+>/g, '')}...
                      </p>
                    </Link>

                    {/* Action Bar */}
                    <div className="blog-card-actions">
                      <span className="blog-card-date">{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                      <span className="stats-btn" style={{ cursor: 'default' }}>
                        <Clock size={12} /> <span style={{ fontSize: '0.75rem' }}>{calculateReadTime(blog.content)}</span>
                      </span>
                      <div className="blog-card-stats">
                        <button className="stats-btn" title="Like">
                          <Heart size={14} /> <span>{blog.likes_count || 0}</span>
                        </button>
                        <button className="stats-btn" title="Comment">
                          <MessageCircle size={14} /> <span>0</span>
                        </button>
                        <button className="stats-btn" title="Views">
                          <Eye size={14} /> <span>{blog.views_count || 0}</span>
                        </button>
                        <button className="stats-btn" title="Share">
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

        {/* About Me Section (Collapsible on Mobile) */}
        <section className="about-column">
          <AboutMe settings={settings} />
        </section>
      </div>
    </div>
  );
}
