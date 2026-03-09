import { createClient } from './supabase-server'
import { headers } from 'next/headers'
import { createHash } from 'crypto'

export async function getFingerprint() {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'
  const ua = headersList.get('user-agent') || 'unknown'

  // Create a stable hash of IP + UserAgent
  return createHash('sha256')
    .update(`${ip}-${ua}`)
    .digest('hex')
}

export async function checkRateLimit(action: string, limit: number, windowMinutes: number = 60) {
  const fingerprint = await getFingerprint()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', fingerprint) // Updated from ip_address
    .eq('action_type', action)
    .single()

  const now = new Date()

  if (data) {
    const lastRequest = new Date(data.last_request)
    const minutesSinceLast = (now.getTime() - lastRequest.getTime()) / (1000 * 60)

    if (minutesSinceLast < windowMinutes) {
      if (data.request_count >= limit) {
        const resetMinutes = Math.ceil(windowMinutes - minutesSinceLast)
        return {
          allowed: false,
          error: `Too many requests. Please try again in ${resetMinutes} minute${resetMinutes === 1 ? '' : 's'}.`,
          fingerprint
        }
      }

      await supabase
        .from('rate_limits')
        .update({
          request_count: data.request_count + 1,
          last_request: now.toISOString()
        })
        .eq('id', data.id)
    } else {
      // Reset after the window expires
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
        { identifier: fingerprint, action_type: action, request_count: 1, last_request: now.toISOString() }
      ])
  }

  return { allowed: true, fingerprint }
}
