'use server'

import { createClient } from '@/lib/supabase-server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  const rateLimit = await checkRateLimit('subscribe', 10, 1440)
  if (!rateLimit.allowed) return { error: rateLimit.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('subscribers')
    .insert([{ email }])

  if (error) {
    if (error.code === '23505') {
      return { error: 'You are already subscribed!' }
    }
    return { error: 'Something went wrong. Please try again.' }
  }

  // Send the welcome email in the background
  import('@/lib/mail').then(({ sendWelcomeEmail }) => {
    sendWelcomeEmail(email).catch(console.error);
  });

  return { success: true }
}
