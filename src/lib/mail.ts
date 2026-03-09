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
            subject: `${title} | Shrutea`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f4f1ea; color: #333; line-height: 1.6; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://www.shrutea.in/logo_nav.png" alt="Shrutea" style="height: 50px; width: auto;" />
          </div>
          <p>Hi,</p>
          <p>I just published a new piece on the blog: <strong>${title}</strong></p>
          <p>If you'd like to read it, you can find it here:<br/>
          <a href="${blogUrl}" style="color: #061a30; font-weight: bold;">${blogUrl}</a></p>
          <p>As always, if something in it resonates with you (or even if it doesn't), feel free to write to me at <a href="mailto:shruanalytics@gmail.com" style="color: #061a30;">shruanalytics@gmail.com</a>. I always enjoy hearing different thoughts and perspectives.</p>
          <p>Thanks for reading and being here.</p>
          <br/>
          <p>Warmly,<br/>Shruthi</p>
          
          <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e0ddd6;" />
          <p style="font-size: 12px; color: #888; text-align: center;">You're receiving this because you subscribed to Shrutea.in</p>
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
            subject: 'Thank you for subscribing to Shrutea!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f4f1ea; color: #333; line-height: 1.6; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://www.shrutea.in/logo_nav.png" alt="Shrutea" style="height: 50px; width: auto;" />
          </div>
          <p>Hi there,</p>
          <p>Thank you for subscribing. It truly means a lot that you chose to spend a little corner of your inbox on something I write.</p>
          <p>This space is where I share thoughts about life as it happens — sometimes inspired, sometimes chaotic, sometimes just quiet reflections about the small moments we forget to notice.</p>
          <p>I'm really glad you're here.</p>
          <p>If you ever feel like sharing a thought, reacting to something I wrote, or simply saying hello, you can always reach me at <strong><a href="mailto:shruanalytics@gmail.com" style="color: #061a30;">shruanalytics@gmail.com</a></strong>. I'd genuinely love to hear from you.</p>
          <p>Thanks again for being part of this little journey.</p>
          <br/>
          <p>Warmly,<br/>Shruthi</p>

          <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e0ddd6;" />
          <p style="font-size: 12px; color: #888; text-align: center;">You're receiving this because you subscribed to Shrutea.in</p>
        </div>
      `
        });
    } catch (err) {
        console.error('Welcome email failed:', err);
    }
}
