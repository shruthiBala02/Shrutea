import { createClient } from './supabase-server'
import { headers } from 'next/headers'

export async function checkRateLimit(action: string, limit: number) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ip)
    .eq('action_type', action)
    .single()

  const now = new Date()
  
  if (data) {
    const lastRequest = new Date(data.last_request)
    const hoursSinceLast = (now.getTime() - lastRequest.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLast < 1) {
      if (data.request_count >= limit) {
        return { allowed: false, error: 'Too many requests. Please try again in an hour.' }
      }
      
      await supabase
        .from('rate_limits')
        .update({ 
          request_count: data.request_count + 1,
          last_request: now.toISOString()
        })
        .eq('id', data.id)
    } else {
      // Reset after an hour
      await supabase
        .from('rate_limits')
        .update({ 
          request_count: 1,
          last_request: now.toISOString()
        })
        .eq('id', data.id)
    }
  } else {
    // New Entry
    await supabase
      .from('rate_limits')
      .insert([
        { ip_address: ip, action_type: action, request_count: 1, last_request: now.toISOString() }
      ])
  }

  return { allowed: true }
}
