/**
 * Email Service Module
 *
 * This module provides an abstraction layer for sending emails.
 * Currently configured to log emails to console, but designed for easy
 * integration with email service providers like:
 * - Resend (https://resend.com)
 * - SendGrid (https://sendgrid.com)
 * - AWS SES
 * - Postmark
 *
 * To integrate an email provider:
 * 1. Install the provider's SDK (e.g., `npm install resend`)
 * 2. Set the required environment variables
 * 3. Update the sendEmail function implementation
 */

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text: string
  from?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Email provider type for future configuration
export type EmailProvider = 'console' | 'resend' | 'sendgrid' | 'ses'

// Get the configured email provider
const getEmailProvider = (): EmailProvider => {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER as EmailProvider
  return provider || 'console'
}

// Default sender email
const DEFAULT_FROM = import.meta.env.VITE_EMAIL_FROM || 'noreply@dreamweddingday.com'

/**
 * Send an email using the configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const provider = getEmailProvider()
  const from = options.from || DEFAULT_FROM

  switch (provider) {
    case 'resend':
      return sendWithResend({ ...options, from })

    case 'sendgrid':
      return sendWithSendGrid({ ...options, from })

    case 'ses':
      return sendWithSES({ ...options, from })

    case 'console':
    default:
      return sendToConsole({ ...options, from })
  }
}

/**
 * Console logger for development (no actual email sent)
 */
async function sendToConsole(options: EmailOptions): Promise<EmailResult> {
  console.log('='.repeat(60))
  console.log('EMAIL SENT (Development Mode)')
  console.log('='.repeat(60))
  console.log(`From: ${options.from}`)
  console.log(`To: ${options.to}`)
  console.log(`Subject: ${options.subject}`)
  console.log('-'.repeat(60))
  console.log('HTML Content:')
  console.log(options.html.substring(0, 500) + '...')
  console.log('-'.repeat(60))
  console.log('Text Content:')
  console.log(options.text)
  console.log('='.repeat(60))

  return {
    success: true,
    messageId: `dev-${Date.now()}`
  }
}

/**
 * Send email via Resend
 * Requires: VITE_RESEND_API_KEY environment variable
 */
async function sendWithResend(options: EmailOptions): Promise<EmailResult> {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY

  if (!apiKey) {
    console.error('VITE_RESEND_API_KEY is not configured')
    return { success: false, error: 'Resend API key not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return {
      success: true,
      messageId: data.id
    }
  } catch (error) {
    console.error('Resend email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send email via SendGrid
 * Requires: VITE_SENDGRID_API_KEY environment variable
 */
async function sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
  const apiKey = import.meta.env.VITE_SENDGRID_API_KEY

  if (!apiKey) {
    console.error('VITE_SENDGRID_API_KEY is not configured')
    return { success: false, error: 'SendGrid API key not configured' }
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: options.from },
        subject: options.subject,
        content: [
          { type: 'text/plain', value: options.text },
          { type: 'text/html', value: options.html }
        ]
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.errors?.[0]?.message || 'Failed to send email')
    }

    return {
      success: true,
      messageId: response.headers.get('X-Message-Id') || `sendgrid-${Date.now()}`
    }
  } catch (error) {
    console.error('SendGrid email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send email via AWS SES
 * Requires: Backend API endpoint that handles SES
 */
async function sendWithSES(options: EmailOptions): Promise<EmailResult> {
  // AWS SES requires server-side credentials, so we call our API
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email')
    }

    return {
      success: true,
      messageId: data.messageId
    }
  } catch (error) {
    console.error('SES email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send bulk emails with rate limiting
 */
export async function sendBulkEmails(
  emails: EmailOptions[],
  options?: { batchSize?: number; delayMs?: number }
): Promise<EmailResult[]> {
  const batchSize = options?.batchSize || 5
  const delayMs = options?.delayMs || 1000
  const results: EmailResult[] = []

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(sendEmail))
    results.push(...batchResults)

    // Add delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}
