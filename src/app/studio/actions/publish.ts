'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { isAuthenticated } from '@/app/login/actions/auth'
import { sendNewPostEmail } from '@/lib/mail'

export async function publishBlog(title: string, content: string, imageUrl: string | null, themeColor: string, profileUrl: string, existingId: string | null = null) {
  const supabase = await createClient()

  // Verify the user is authenticated via cookie
  const isAuth = await isAuthenticated()
  if (!isAuth) {
    return { error: 'You must be logged in to publish a blog.' }
  }

  let resultId;

  if (existingId) {
    // Update existing blog
    const { data, error } = await supabase
      .from('blogs')
      .update({ title, content, image_url: imageUrl, theme_color: themeColor })
      .eq('id', existingId)
      .select()

    if (error) {
      console.error('Error updating blog:', error.message)
      return { error: error.message }
    }
    resultId = data[0].id
  } else {
    // Insert new blog
    const { data, error } = await supabase
      .from('blogs')
      .insert([
        { title, content, image_url: imageUrl, is_published: true, theme_color: themeColor }
      ])
      .select()

    if (error) {
      console.error('Error publishing blog:', error.message)
      return { error: error.message }
    }
    resultId = data[0].id

    // Trigger automated email alert for NEW posts
    // We do this in the background, don't await it to keep the UI fast
    sendNewPostEmail(title, resultId);
  }

  // Update site settings profile image
  if (profileUrl) {
    await supabase.from('site_settings').upsert({ id: 1, profile_image_url: profileUrl });
  }

  revalidatePath('/')
  return { success: true, blogId: resultId }
}
