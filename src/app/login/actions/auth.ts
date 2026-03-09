'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'

const SECRET_CODE = 'RV(9j52c'

// Simple in-memory brute-force store (server-action layer back-stop)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

async function getLoginIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
}

export async function loginWithCode(code: string) {
  const ip = await getLoginIp()
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const MAX_ATTEMPTS = 5

  const entry = loginAttempts.get(ip)
  if (entry && now < entry.resetAt) {
    if (entry.count >= MAX_ATTEMPTS) {
      const remainingMins = Math.ceil((entry.resetAt - now) / 60000)
      return { error: `Too many attempts. Try again in ${remainingMins} minute${remainingMins === 1 ? '' : 's'}.` }
    }
    entry.count += 1
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs })
  }

  if (code === SECRET_CODE) {
    // Clear attempts on success
    loginAttempts.delete(ip)
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    return { success: true }
  }

  return { error: 'Invalid secret code.' }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
  redirect('/')
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}
