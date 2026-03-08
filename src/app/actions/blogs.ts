'use server'

import { createClient } from '@/lib/supabase-server'

export async function getPublishedBlogs() {
  const supabase = await createClient()
  
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blogs:', error.message)
    return []
  }

  return blogs
}

export async function getAllBlogs() {
  const supabase = await createClient()
  
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all blogs:', error.message)
    return []
  }

  return blogs
}

export async function getBlogBySlug(id: string) {
  const supabase = await createClient()
  
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching blog:', error.message)
    return null
  }

  return blog
}

export async function getBlogComments(blogId: string) {
  const supabase = await createClient()
  
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('blog_id', blogId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error.message)
    return []
  }

  return comments
}

export async function getSiteSettings() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('profile_image_url')
    .eq('id', 1)
    .single()

  if (error || !data) {
    return { profile_image_url: '' }
  }

  return data
}

export async function getAdminStats() {
  const supabase = await createClient()
  
  const { data: blogs } = await supabase.from('blogs').select('likes_count, views_count')
  const { count: subsCount } = await supabase.from('subscribers').select('*', { count: 'exact', head: true })

  const stats = { views: 0, likes: 0, subscribers: subsCount || 0 }

  if (blogs) {
    stats.views = blogs.reduce((acc, curr) => acc + (curr.views_count || 0), 0)
    stats.likes = blogs.reduce((acc, curr) => acc + (curr.likes_count || 0), 0)
  }

  return stats
}

import { isAuthenticated } from '@/app/login/actions/auth'
import { revalidatePath } from 'next/cache'

export async function deleteBlog(id: string) {
  const supabase = await createClient()

  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return { error: 'You must be logged in to delete a blog.' }
  }

  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting blog:', error.message)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/studio')
  return { success: true }
}
