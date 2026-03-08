'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/rate-limit'

export async function likePost(blogId: string) {
  const rateLimit = await checkRateLimit('like', 100)
  if (!rateLimit.allowed) return { error: rateLimit.error }

  const supabase = await createClient()
  
  const { data: currentBlog } = await supabase
    .from('blogs')
    .select('likes_count')
    .eq('id', blogId)
    .single()
    
  if (currentBlog) {
    await supabase
      .from('blogs')
      .update({ likes_count: (currentBlog.likes_count || 0) + 1 })
      .eq('id', blogId)
  }

  revalidatePath(`/blog/${blogId}`)
  return { success: true }
}

export async function addComment(blogId: string, email: string, content: string) {
  if (!email || !email.includes('@')) {
    return { error: 'A valid email address is required to comment.' }
  }
  
  const rateLimit = await checkRateLimit('comment', 10)
  if (!rateLimit.allowed) return { error: rateLimit.error }

  const supabase = await createClient()

  // Check comment count for this email on this post
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('blog_id', blogId)
    .eq('author_email', email)

  if (count && count >= 5) {
    return { error: 'Maximum of 5 comments per post reached for this email.' }
  }

  // Simple HTML Sanitization
  const sanitizedContent = content.replace(/<[^>]*>?/gm, '')
  if (!sanitizedContent.trim()) {
    return { error: 'Comment cannot be empty.' }
  }

  const authorName = email.split('@')[0]

  const { error } = await supabase
    .from('comments')
    .insert([
      { blog_id: blogId, author_name: authorName, author_email: email, content: sanitizedContent }
    ])

  if (error) {
    console.error('Error adding comment:', error.message)
    return { error: 'Failed to add comment.' }
  }

  revalidatePath(`/blog/${blogId}`)
  return { success: true }
}

export async function incrementView(blogId: string) {
  const rateLimit = await checkRateLimit('view', 1000)
  if (!rateLimit.allowed) return

  const supabase = await createClient()
  
  const { data: currentBlog } = await supabase
    .from('blogs')
    .select('views_count')
    .eq('id', blogId)
    .single()
    
  if (currentBlog) {
    await supabase
      .from('blogs')
      .update({ views_count: (currentBlog.views_count || 0) + 1 })
      .eq('id', blogId)
  }
}
