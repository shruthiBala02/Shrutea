'use server'

import { createClient } from '@/lib/supabase-server'
import { checkRateLimit } from '@/lib/rate-limit'
import { revalidatePath } from 'next/cache'
import { isAuthenticated } from '@/app/login/actions/auth'

export async function leaveMessage(content: string) {
    if (!content || content.trim().length === 0) {
        return { error: 'Message cannot be empty.' }
    }

    if (content.length > 500) {
        return { error: 'Message is too long (max 500 characters).' }
    }


    // Rate limit: 1 message per 24 hours (1440 minutes)
    const rateLimit = await checkRateLimit('message', 1, 1440)
    if (!rateLimit.allowed) {
        return { error: 'Only one message per day! Your thoughts are valued, see you tomorrow!' }
    }

    const supabase = await createClient()
    const fingerprint = rateLimit.fingerprint
    const { error } = await supabase
        .from('guest_messages')
        .insert({ fingerprint, content: content.trim() })

    if (error) {
        console.error('Error saving message:', error.message)
        return { error: 'Failed to leave message. Please try again.' }
    }

    revalidatePath('/studio')
    return { success: true }
}

export async function getMessages() {
    const isAuth = await isAuthenticated()
    if (!isAuth) return []

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('guest_messages')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching messages:', error.message)
        return []
    }

    return data
}

export async function deleteMessage(id: string) {
    const isAuth = await isAuthenticated()
    if (!isAuth) return { error: 'Unauthorized' }

    const supabase = await createClient()
    const { error } = await supabase
        .from('guest_messages')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting message:', error.message)
        return { error: error.message }
    }

    revalidatePath('/studio')
    return { success: true }
}
