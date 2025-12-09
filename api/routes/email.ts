/**
 * Email sending routes
 */
import { Router, type Request, type Response } from 'express'
import { Resend } from 'resend'

const router = Router()

// Initialize Resend with API key (optional - falls back to mock in dev)
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

interface SendEmailRequest {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

interface BulkEmailRequest {
  emails: SendEmailRequest[]
}

/**
 * Send a single email
 * POST /api/email/send
 */
router.post('/send', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, html, text, from } = req.body as SendEmailRequest

    if (!to || !subject || !html) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, html'
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email address'
      })
      return
    }

    if (resend) {
      // Production: Send via Resend
      const { data, error } = await resend.emails.send({
        from: from || 'Dream Wedding Day <noreply@dreamweddingday.com>',
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      })

      if (error) {
        console.error('Resend error:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to send email',
          details: error.message
        })
        return
      }

      console.log(`Email sent successfully to ${to}:`, data?.id)
      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        id: data?.id
      })
    } else {
      // Development: Mock email sending
      console.log('='.repeat(60))
      console.log('MOCK EMAIL (No RESEND_API_KEY configured)')
      console.log('='.repeat(60))
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`From: ${from || 'noreply@dreamweddingday.com'}`)
      console.log('-'.repeat(60))
      console.log('HTML Preview (first 500 chars):')
      console.log(html.substring(0, 500) + (html.length > 500 ? '...' : ''))
      console.log('='.repeat(60))

      res.status(200).json({
        success: true,
        message: 'Email simulated (development mode)',
        mock: true,
        recipient: to
      })
    }
  } catch (error) {
    console.error('Email send error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error while sending email'
    })
  }
})

/**
 * Send bulk emails (batch)
 * POST /api/email/send-bulk
 */
router.post('/send-bulk', async (req: Request, res: Response): Promise<void> => {
  try {
    const { emails } = req.body as BulkEmailRequest

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid emails array'
      })
      return
    }

    if (emails.length > 100) {
      res.status(400).json({
        success: false,
        error: 'Maximum 100 emails per batch'
      })
      return
    }

    const results: { email: string; success: boolean; error?: string; id?: string }[] = []

    if (resend) {
      // Production: Send via Resend batch API
      const batchEmails = emails.map(email => ({
        from: email.from || 'Dream Wedding Day <noreply@dreamweddingday.com>',
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text || email.html.replace(/<[^>]*>/g, '')
      }))

      const { data, error } = await resend.batch.send(batchEmails)

      if (error) {
        console.error('Resend batch error:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to send batch emails',
          details: error.message
        })
        return
      }

      // Map results
      emails.forEach((email, index) => {
        results.push({
          email: email.to,
          success: true,
          id: data?.data?.[index]?.id
        })
      })

      console.log(`Batch of ${emails.length} emails sent successfully`)
    } else {
      // Development: Mock batch sending
      console.log('='.repeat(60))
      console.log(`MOCK BATCH EMAIL (${emails.length} emails)`)
      console.log('='.repeat(60))

      for (const email of emails) {
        console.log(`- ${email.to}: "${email.subject}"`)
        results.push({
          email: email.to,
          success: true
        })
      }

      console.log('='.repeat(60))
    }

    res.status(200).json({
      success: true,
      message: `${results.length} emails processed`,
      results,
      mock: !resend
    })
  } catch (error) {
    console.error('Bulk email error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error while sending bulk emails'
    })
  }
})

/**
 * Check email service status
 * GET /api/email/status
 */
router.get('/status', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    configured: !!resend,
    provider: resend ? 'resend' : 'mock',
    message: resend
      ? 'Email service is configured and ready'
      : 'Running in mock mode (set RESEND_API_KEY for production)'
  })
})

export default router
