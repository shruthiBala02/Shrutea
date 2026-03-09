'use server'

import { Resend } from 'resend';
import { createClient } from './supabase-server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewPostEmail(title: string, slug: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not found. Skipping email notifications.');
        return;
    }

    const supabase = await createClient();
    const { data: subscribers } = await supabase
        .from('subscribers')
        .select('email');

    if (!subscribers || subscribers.length === 0) return;

    const blogUrl = `https://shrutea.in/blog/${slug}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Shrutea. <hello@shrutea.in>',
            to: subscribers.map(s => s.email),
            replyTo: 'shruanalytics@gmail.com',
            subject: `New Post: ${title} ✨`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #061a30;">New Blog Post Alert! 🥂</h1>
          <p>Hi there! I just published a new piece on <strong>Shrutea.</strong></p>
          <h2 style="margin-top: 30px;">${title}</h2>
          <p style="margin-bottom: 30px;">I'd love to hear your thoughts on this one.</p>
          <a href="${blogUrl}" style="background-color: #061a30; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Read the full story
          </a>
          <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999; text-align: center;">You're receiving this because you subscribed to Shrutea's blog.</p>
        </div>
      `
        });

        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Emails sent successfully:', data);
        }
    } catch (err) {
        console.error('Email automation failed:', err);
    }
}

export async function sendWelcomeEmail(email: string) {
    if (!process.env.RESEND_API_KEY) return;

    try {
        await resend.emails.send({
            from: 'Shrutea. <hello@shrutea.in>',
            to: email,
            replyTo: 'shruanalytics@gmail.com',
            subject: 'Welcome to Shrutea! ✨',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #061a30;">Welcome aboard! ☕️</h1>
          <p>Hi there,</p>
          <p>Thank you so much for subscribing to <strong>Shrutea</strong>. I'm thrilled to have you here.</p>
          <p>You'll now be the very first to know whenever I publish a new essay, insight, or story.</p>
          <p>If you ever want to chat or share your thoughts, just reply directly to this email!</p>
          <br/>
          <p>With love,</p>
          <p><strong>Shruthi</strong></p>
          <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999; text-align: center;">You're receiving this because you subscribed to Shrutea.in</p>
        </div>
      `
        });
    } catch (err) {
        console.error('Welcome email failed:', err);
    }
}
