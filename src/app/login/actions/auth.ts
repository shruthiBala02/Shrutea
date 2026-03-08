'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SECRET_CODE = 'RV(9j52c'

export async function loginWithCode(code: string) {
  if (code === SECRET_CODE) {
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
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
