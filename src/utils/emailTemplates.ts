import { Wedding, Guest, Event } from '@/lib/supabase'

interface EmailTemplateProps {
  wedding: Wedding
  guest: Guest
  event: Event
  magicLink: string
  customMessage?: string
}

export function generateRSVPInvitationEmail({ wedding, guest, event, magicLink, customMessage }: EmailTemplateProps) {
  const weddingDate = new Date(wedding.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const eventTime = new Date(event.start_time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  return {
    subject: `You're Invited! ${wedding.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited!</title>
        <style>
          body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #fdf2f8; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .details { background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Invited!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${wedding.title}</p>
          </div>
          
          <div class="content">
            <p style="font-size: 18px; margin-bottom: 20px;">Dear ${guest.name},</p>
            
            ${customMessage ? `<p style="margin-bottom: 20px; font-style: italic;">${customMessage}</p>` : ''}
            
            <p style="margin-bottom: 20px;">We're thrilled to invite you to celebrate our special day! Please join us for:</p>
            
            <div class="details">
              <h3 style="margin: 0 0 15px 0; color: #374151;">${event.title}</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${weddingDate}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${eventTime}</p>
              ${event.location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${event.location}</p>` : ''}
              ${wedding.venue_name ? `<p style="margin: 5px 0;"><strong>Venue:</strong> ${wedding.venue_name}</p>` : ''}
              ${wedding.venue_address ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${wedding.venue_address}</p>` : ''}
            </div>
            
            <p style="margin-bottom: 20px;">We would love for you to be part of our celebration. Please RSVP by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" class="button">RSVP Now</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <span style="word-break: break-all;">${magicLink}</span>
            </p>
            
            <p style="margin-top: 30px;">We can't wait to celebrate with you!</p>
            
            <p style="margin-top: 20px;">With love,<br>
            ${wedding.title.includes('and') ? wedding.title.split('and')[0].trim() : 'The Happy Couple'}</p>
          </div>
          
          <div class="footer">
            <p>This is a personalized invitation. Please do not forward.</p>
            <p>© ${new Date().getFullYear()} ${wedding.title}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
You're Invited! 🎉

Dear ${guest.name},

${customMessage ? `${customMessage}\n\n` : ''}
We're thrilled to invite you to celebrate our special day!

WEDDING DETAILS:
Event: ${event.title}
Date: ${weddingDate}
Time: ${eventTime}
${event.location ? `Location: ${event.location}\n` : ''}
${wedding.venue_name ? `Venue: ${wedding.venue_name}\n` : ''}
${wedding.venue_address ? `Address: ${wedding.venue_address}\n` : ''}

We would love for you to be part of our celebration. Please RSVP using this link:
${magicLink}

We can't wait to celebrate with you!

With love,
${wedding.title.includes('and') ? wedding.title.split('and')[0].trim() : 'The Happy Couple'}

---
This is a personalized invitation. Please do not forward.
© ${new Date().getFullYear()} ${wedding.title}. All rights reserved.
    `
  }
}

export function generateRSVPConfirmationEmail(wedding: Wedding, guest: Guest, status: 'confirmed' | 'declined') {
  const weddingDate = new Date(wedding.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return {
    subject: status === 'confirmed' 
      ? `RSVP Confirmed! See you at ${wedding.title}` 
      : `RSVP Received - Thank you for letting us know`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RSVP ${status === 'confirmed' ? 'Confirmed' : 'Received'}</title>
        <style>
          body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #f0fdf4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
          .header { background: ${status === 'confirmed' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6b7280, #4b5563)'}; color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .details { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${status === 'confirmed' ? '🎉 RSVP Confirmed!' : '😊 Thank You'}</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 18px; margin-bottom: 20px;">Dear ${guest.name},</p>
            
            ${status === 'confirmed' 
              ? '<p>We\'re so excited that you\'ll be joining us! Your RSVP has been confirmed.</p>'
              : '<p>Thank you for letting us know. We appreciate you taking the time to respond.</p>'
            }
            
            <div class="details">
              <h3 style="margin: 0 0 15px 0; color: #374151;">${wedding.title}</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${weddingDate}</p>
              ${wedding.venue_name ? `<p style="margin: 5px 0;"><strong>Venue:</strong> ${wedding.venue_name}</p>` : ''}
            </div>
            
            ${status === 'confirmed' 
              ? '<p>We can\'t wait to celebrate with you!</p>'
              : '<p>We\'re sorry you won\'t be able to join us, but we appreciate your kind response.</p>'
            }
            
            <p style="margin-top: 20px;">With love,<br>
            ${wedding.title.includes('and') ? wedding.title.split('and')[0].trim() : 'The Happy Couple'}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${status === 'confirmed' ? '🎉 RSVP Confirmed!' : '😊 Thank You'}

Dear ${guest.name},

${status === 'confirmed' 
  ? "We're so excited that you'll be joining us! Your RSVP has been confirmed."
  : "Thank you for letting us know. We appreciate you taking the time to respond."
}

WEDDING DETAILS:
${wedding.title}
Date: ${weddingDate}
${wedding.venue_name ? `Venue: ${wedding.venue_name}` : ''}

${status === 'confirmed' 
  ? "We can't wait to celebrate with you!"
  : "We're sorry you won't be able to join us, but we appreciate your kind response."
}

With love,
${wedding.title.includes('and') ? wedding.title.split('and')[0].trim() : 'The Happy Couple'}
    `
  }
}