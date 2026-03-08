'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function likePost(blogId: string) {
  const supabase = await createClient()

  // We simply increment the likes count atomically using an RPC if possible,
  // or a direct read/write update for simplicity in this context.
  
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
  const supabase = await createClient()

  const authorName = email.split('@')[0]

  const { error } = await supabase
    .from('comments')
    .insert([
      { blog_id: blogId, author_name: authorName, content: content }
    ])

  if (error) {
    console.error('Error adding comment:', error.message)
    return { error: 'Failed to add comment.' }
  }

  revalidatePath(`/blog/${blogId}`)
  return { success: true }
}

export async function incrementView(blogId: string) {
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
