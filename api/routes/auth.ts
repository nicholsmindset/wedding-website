/**
 * Authentication API Routes
 *
 * Note: This application uses Supabase Auth for authentication.
 * These routes are placeholders for any custom auth logic needed.
 */
import { Router, type Request, type Response } from 'express'

const router = Router()

/**
 * User Registration
 * POST /api/auth/register
 *
 * Note: Registration is handled by Supabase Auth UI.
 * This endpoint is a placeholder for custom registration logic.
 */
router.post('/register', async (_req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Registration is handled by Supabase Auth. Use the frontend auth flow.'
  })
})

/**
 * User Login
 * POST /api/auth/login
 *
 * Note: Login is handled by Supabase Auth (magic link).
 * This endpoint is a placeholder for custom login logic.
 */
router.post('/login', async (_req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Login is handled by Supabase Auth. Use the frontend auth flow.'
  })
})

/**
 * User Logout
 * POST /api/auth/logout
 *
 * Note: Logout is handled client-side via Supabase Auth.
 * This endpoint is a placeholder for any server-side cleanup.
 */
router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Logout is handled by Supabase Auth. Use the frontend auth flow.'
  })
})

export default router
