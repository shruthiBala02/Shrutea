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
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#061a30');
  const [profileUrl, setProfileUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'publishing' | 'success' | 'error' | 'uploading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [stats, setStats] = useState({ views: 0, likes: 0, subscribers: 0 });
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    getAdminStats().then(setStats);
    getAllBlogs().then(setBlogsList);
  }, []);

  const loadBlog = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      // New post
      setSelectedBlogId(null);
      setTitle('');
      editor?.commands.setContent('<p>Start writing your masterpiece...</p>');
      setImageUrl('');
      setThemeColor('rgba(6, 26, 48, 0.7)');
      return;
    }
    
    setSelectedBlogId(id);
    const blog = await getBlogBySlug(id);
    if (blog) {
      setTitle(blog.title);
      editor?.commands.setContent(blog.content);
      setImageUrl(blog.image_url || '');
      setThemeColor(blog.theme_color || 'rgba(6, 26, 48, 0.7)');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    let file = e.target.files?.[0];
    if (!file) return;
    
    setStatus('uploading');
    try {
      // Convert HEIC to JPEG for browser support
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
      setErrorMessage('Failed to upload image. Ensure the storage bucket is created.');
      setStatus('error');
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
      }),
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
      router.push(`/blog/${res.blogId}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedBlogId) return;
    if (!window.confirm("Are you sure you want to permanently delete this beautiful post?")) return;

    setStatus('publishing'); // Reusing this status for the loading state
    const res = await deleteBlog(selectedBlogId);
    
    if (res.error) {
      setStatus('error');
      setErrorMessage(res.error);
    } else {
      // Clear the form to start fresh
      setSelectedBlogId(null);
      setTitle('');
      editor?.commands.setContent('<p>Start writing your masterpiece...</p>');
      setImageUrl('');
      setStatus('idle');
      // Refresh the blog list
      getAllBlogs().then(setBlogsList);
      getAdminStats().then(setStats);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-lg)" }}>
        <h1>Studio Mode</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {status === 'error' && <span style={{ color: 'var(--feedback-error)', fontSize: '0.85rem' }}>{errorMessage}</span>}
          {status === 'uploading' && <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem' }}>Uploading Image...</span>}
          
          <select onChange={loadBlog} value={selectedBlogId || ''} style={{ padding: "0.5rem", background: "var(--bg-color)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
            <option value="">+ Create New Post</option>
            {blogsList.map(b => <option key={b.id} value={b.id}>Edit: {b.title}</option>)}
          </select>
          
          <button onClick={() => setIsPreview(!isPreview)} className="btn-secondary">
            {isPreview ? 'Back to Edit' : 'Preview'}
          </button>
          
          {selectedBlogId && (
            <button onClick={handleDelete} disabled={status === 'publishing' || status === 'uploading'} style={{ background: "transparent", color: "var(--feedback-error)", border: "1px solid var(--feedback-error)", padding: "0.6rem 1.2rem", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 500 }}>
              Delete Post
            </button>
          )}

          <button onClick={handlePublish} disabled={status === 'publishing' || status === 'uploading'} className="btn-primary">
            {status === 'publishing' ? 'Processing...' : (selectedBlogId ? 'Update Post' : 'Publish Post')}
          </button>
        </div>
      </header>
      
      {/* Stats Summary Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-xl)" }}>
        <div className="card" style={{ padding: "var(--space-md)", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--text-lighter)" }}>{stats.views}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Total Views</div>
        </div>
        <div className="card" style={{ padding: "var(--space-md)", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--accent-color)" }}>{stats.likes}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Total Likes</div>
        </div>
        <div className="card" style={{ padding: "var(--space-md)", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10B981" }}>{stats.subscribers}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Subscribers</div>
        </div>
      </div>

      {/* Editor / Preview Section */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        
        {!isPreview && (
          <>
            {/* Editor Toolbar */}
            <div style={{ padding: "var(--space-sm) var(--space-md)", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "0.5rem", flexWrap: "wrap", background: "var(--bg-hover)" }}>
              <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn-secondary" style={{ padding: "0.5rem" }} title="Bold">
                 <Bold size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn-secondary" style={{ padding: "0.5rem" }} title="Italic">
                 <Italic size={16} />
              </button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="btn-secondary" style={{ padding: "0.5rem" }} title="Underline">
                 <UnderlineIcon size={16} />
              </button>
              
              <div style={{ width: "1px", background: "var(--border-color)", margin: "0 0.5rem" }}></div>
              
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="btn-secondary" style={{ padding: "0.5rem", fontWeight: 700 }} title="Heading 1">
                 H1
              </button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="btn-secondary" style={{ padding: "0.5rem", fontWeight: 600 }} title="Heading 2">
                 H2
              </button>
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn-secondary" style={{ padding: "0.5rem" }} title="Bullet List">
                 <List size={16} />
              </button>
              
              <div style={{ width: "1px", background: "var(--border-color)", margin: "0 0.5rem" }}></div>
              
              <button onClick={() => {
                const url = window.prompt('URL');
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }} className="btn-secondary" style={{ padding: "0.5rem" }} title="Add Link">
                 <LinkIcon size={16} />
              </button>
            </div>

            {/* Info Fields */}
            <div style={{ padding: "var(--space-md)", borderBottom: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Update Global Profile Picture</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setProfileUrl)}
                    style={{ fontSize: "0.95rem", padding: "0.5rem" }} 
                  />
                  {profileUrl && <span style={{ fontSize: "0.8rem", color: "var(--accent-color)" }}>Uploaded!</span>}
                </div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Post Thumbnail Color</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input 
                      type="color" 
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      style={{ width: "40px", height: "40px", padding: 0, border: "none", cursor: "pointer", background: "none" }} 
                    />
                    <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{themeColor}</span>
                  </div>
                </div>
              </div>

              <input 
                type="text" 
                placeholder="Post Title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ fontSize: "2rem", fontWeight: 700, padding: 0, border: "none", background: "transparent", color: "var(--text-lighter)" }} 
              />
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Post Cover Image (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setImageUrl)}
                  style={{ fontSize: "0.95rem", padding: "0.5rem" }} 
                />
                {imageUrl && <span style={{ fontSize: "0.8rem", color: "var(--accent-color)" }}>Uploaded!</span>}
              </div>
            </div>
            
            <div style={{ padding: "var(--space-lg)", cursor: "text" }} onClick={() => editor.commands.focus()}>
              <EditorContent editor={editor} />
            </div>
          </>
        )}

        {isPreview && (
          <div style={{ padding: "var(--space-2xl)", background: "var(--bg-color)" }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem", lineHeight: "1.2", letterSpacing: "-1px" }}>{title || 'Untitled Blog Post'}</h1>
            {imageUrl && (
               <img src={imageUrl} alt="" style={{ width: "100%", height: "auto", maxHeight: "400px", objectFit: "cover", borderRadius: "var(--radius-md)", marginBottom: "2rem" }} />
            )}
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
          </div>
        )}
        
      </div>
    </div>
  );
}
