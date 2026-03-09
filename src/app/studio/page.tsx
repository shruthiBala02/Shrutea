"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Heading1, Heading2, List } from 'lucide-react';
import { publishBlog } from './actions/publish';
import { getAdminStats, getAllBlogs, getBlogBySlug, deleteBlog } from '../actions/blogs';
import { createClient } from '@/lib/supabase';

export default function AdminStudio() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'overview' | 'content' | 'editor'>('overview');

  // Post State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#061a30');
  const [profileUrl, setProfileUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'publishing' | 'success' | 'error' | 'uploading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Data State
  const [stats, setStats] = useState({ views: 0, likes: 0, subscribers: 0 });
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const [statsData, blogsData] = await Promise.all([getAdminStats(), getAllBlogs()]);
    setStats(statsData);
    setBlogsList(blogsData);
  };

  const handleCreateNew = () => {
    setSelectedBlogId(null);
    setTitle('');
    editor?.commands.setContent('<p>Start writing your masterpiece...</p>');
    setImageUrl('');
    setThemeColor('#061a30');
    setActiveView('editor');
  };

  const handleEditBlog = async (blog: any) => {
    setSelectedBlogId(blog.id);
    setTitle(blog.title);
    setImageUrl(blog.image_url || '');
    setThemeColor(blog.theme_color || '#061a30');

    // Fetch full blog content
    const fullBlog = await getBlogBySlug(blog.id);
    if (fullBlog) {
      editor?.commands.setContent(fullBlog.content);
    }
    setActiveView('editor');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    let file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    try {
      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        file = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      }

      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('images').upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      setter(data.publicUrl);
      setStatus('idle');
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrorMessage('Failed to upload image.');
      setStatus('error');
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
    ],
    immediatelyRender: false,
    content: '<p>Start writing your masterpiece...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px]',
      },
    },
  });

  const handlePublish = async () => {
    if (!editor || !title.trim()) {
      setStatus('error');
      setErrorMessage('Post Title and Content are required.');
      return;
    }

    setStatus('publishing');
    const htmlContent = editor.getHTML();

    const res = await publishBlog(title, htmlContent, imageUrl || null, themeColor, profileUrl, selectedBlogId);

    if (res.error) {
      setStatus('error');
      setErrorMessage(res.error);
    } else {
      setStatus('success');
      refreshData();
      setActiveView('content');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this masterpiece? This cannot be undone.")) return;

    const res = await deleteBlog(id);
    if (res.error) {
      alert(res.error);
    } else {
      refreshData();
    }
  };

  if (!editor) return null;

  return (
    <div className="studio-container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SHRUTEA STUDIO
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleCreateNew} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bold size={18} /> New Post
          </button>
        </div>
      </header>

      <nav className="studio-nav">
        <button
          onClick={() => setActiveView('overview')}
          className={`studio-nav-item ${activeView === 'overview' ? 'active' : ''}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveView('content')}
          className={`studio-nav-item ${activeView === 'content' ? 'active' : ''}`}
        >
          Content
        </button>
        {activeView === 'editor' && (
          <button className="studio-nav-item active">
            Editor: {title || 'New Post'}
          </button>
        )}
      </nav>

      {activeView === 'overview' && (
        <div className="fade-in">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#6366f1' }}><UnderlineIcon size={24} /></div>
              <div>
                <div className="stat-value">{stats.views}</div>
                <div className="stat-label">Total Views</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#ec4899' }}><Bold size={24} /></div>
              <div>
                <div className="stat-value">{stats.likes}</div>
                <div className="stat-label">Total Likes</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#10b981' }}><List size={24} /></div>
              <div>
                <div className="stat-value">{stats.subscribers}</div>
                <div className="stat-label">Subscribers</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>Welcome back, Creator!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ready to share your next human, messy, and beautiful thought?</p>
            <button onClick={handleCreateNew} className="btn-primary" style={{ padding: '0.8rem 2.5rem' }}>
              Create New Masterpiece
            </button>
          </div>
        </div>
      )}

      {activeView === 'content' && (
        <div className="content-table-wrapper fade-in">
          <table className="content-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogsList.map(blog => (
                <tr key={blog.id}>
                  <td>
                    <button onClick={() => handleEditBlog(blog)} className="studio-post-link">
                      {blog.title}
                    </button>
                  </td>
                  <td>
                    <span className={`badge ${blog.is_published ? 'badge-published' : 'badge-draft'}`}>
                      {blog.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>
                  <td>{blog.views_count || 0}</td>
                  <td>{blog.likes_count || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEditBlog(blog)} className="action-icon-btn" title="Edit Content & Analytics">
                        <UnderlineIcon size={18} />
                      </button>
                      <button onClick={() => handleDelete(blog.id)} className="action-icon-btn delete" title="Delete Permanentely">
                        <List size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeView === 'editor' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={() => setActiveView('content')} className="action-icon-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bold size={18} /> Back to Content
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsPreview(!isPreview)} className="btn-secondary">
                {isPreview ? 'Back to Edit' : 'Preview'}
              </button>
              <button onClick={handlePublish} disabled={status === 'publishing' || status === 'uploading'} className="btn-primary">
                {status === 'publishing' ? 'Saving...' : (selectedBlogId ? 'Update Post' : 'Publish Post')}
              </button>
            </div>
          </div>

          {!isPreview ? (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Toolbar */}
              <div style={{ padding: "var(--space-sm) var(--space-md)", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "0.5rem", flexWrap: "wrap", background: "var(--bg-hover)" }}>
                <button onClick={() => editor.chain().focus().toggleBold().run()} className="action-icon-btn" title="Bold"><Bold size={18} /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className="action-icon-btn" title="Italic"><Italic size={18} /></button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="action-icon-btn" title="H1"><Heading1 size={18} /></button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="action-icon-btn" title="H2"><Heading2 size={18} /></button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="action-icon-btn" title="List"><List size={18} /></button>
                <button onClick={() => {
                  const url = window.prompt('URL');
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                }} className="action-icon-btn" title="Link"><LinkIcon size={18} /></button>
              </div>

              <div style={{ padding: "1.5rem" }}>
                <input
                  type="text"
                  placeholder="Post Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    padding: "0.5rem 0",
                    border: "none",
                    background: "transparent",
                    color: "var(--text-lighter)",
                    width: '100%',
                    marginBottom: '1rem',
                    outline: 'none'
                  }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Cover Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setImageUrl)}
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Thumbnail Color</label>
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div className="editor-content" style={{ cursor: 'text' }}>
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: "var(--space-2xl)", background: "var(--bg-color)" }}>
              <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>{title || 'Untitled Post'}</h1>
              {imageUrl && <img src={imageUrl} alt="" style={{ width: "100%", borderRadius: "var(--radius-md)", marginBottom: "2rem" }} />}
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
