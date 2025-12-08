# Dream Wedding Day

AI-powered wedding planning and photo management platform built with React, TypeScript, and Supabase.

## Features

- **AI Photo Analysis** - Automatically analyze and organize wedding photos using GPT-4 Vision
- **Smart RSVP Management** - Send secure magic link invitations and track responses in real-time
- **Real-time Collaboration** - Live updates for guests, RSVPs, and photos via Supabase Realtime
- **Progressive Web App** - Install on mobile devices for native-like experience
- **Multi-tenant Architecture** - Support for multiple weddings with role-based access

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation

### Backend
- Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Express.js API server (optional)
- Row-Level Security (RLS) for data protection

### AI/ML
- OpenAI GPT-4 Vision for photo analysis
- Vector embeddings for photo similarity search

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wedding-website
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=your-openai-key  # For AI photo analysis
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run migrations from `supabase/migrations/` folder
   - Deploy edge functions from `supabase/functions/`

5. **Start development server**
   ```bash
   pnpm dev
   ```

   This runs both the Vite frontend (port 5173) and Express API (port 3001).

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development servers (frontend + API) |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm check` | TypeScript type checking |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm test:coverage` | Run tests with coverage |

## Project Structure

```
wedding-website/
├── src/
│   ├── components/     # React components
│   │   ├── ui/         # Reusable UI components
│   │   └── ...         # Feature components
│   ├── contexts/       # React Context providers
│   ├── stores/         # Zustand state stores
│   ├── lib/            # Utilities and Supabase client
│   ├── hooks/          # Custom React hooks
│   └── test/           # Test setup and utilities
├── api/                # Express API server
│   └── routes/         # API route handlers
├── supabase/
│   ├── functions/      # Edge Functions (Deno)
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

## Database Schema

The application uses PostgreSQL via Supabase with the following main tables:

- `weddings` - Wedding event details
- `wedding_roles` - User roles (planner, vendor, guest)
- `events` - Wedding events/timeline
- `guests` - Guest list
- `rsvps` - RSVP responses
- `photos` - Photo metadata
- `photo_moments` - AI-detected moments
- `invitation_tokens` - Secure RSVP tokens

All tables have Row-Level Security (RLS) policies for data protection.

## Security

This application implements several security measures:

- **Secure Token Generation** - Uses `crypto.randomUUID()` for invitation links
- **Token Verification** - Validates tokens against database before RSVP
- **Row-Level Security** - Database policies restrict data access
- **CORS Configuration** - API restricts origins
- **Environment Variables** - Sensitive data stored in env vars

### Important Security Notes

1. Never commit `.env` files to version control
2. Rotate Supabase keys if exposed
3. Review RLS policies before production deployment
4. Enable Supabase email confirmations in production

## Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run with coverage
pnpm test:coverage
```

Tests are located in `__tests__` folders next to the code they test.

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Manual Deployment

```bash
pnpm build
```

Output is in the `dist/` folder.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `OPENAI_API_KEY` | Yes* | OpenAI API key for photo analysis |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins |

*Required for AI features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
