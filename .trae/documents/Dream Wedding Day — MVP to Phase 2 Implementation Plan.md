## Overview
- Use current React + Vite + Tailwind client and add Supabase for Auth, Postgres, Storage, Realtime, and Edge Functions.
- Keep local Express dev server for proxying during migration; target Netlify for client hosting and Supabase for backend per PRD.
- Implement MVP first: wedding creation/management, basic RSVP, photo upload/gallery, initial AI photo analysis, simple dashboard.

## Architecture
- Frontend: React (Vite), Tailwind, React Router; mobile-first PWA with offline caching.
- Backend: Supabase (Auth magic links, Postgres, Storage, Realtime, Edge Functions); OpenAI Vision via Supabase Edge Functions.
- Data: pgvector for embeddings; RLS policies for multi-tenant security; GDPR-compliant consent and retention.
- Integrations: Stripe (later phases), SendGrid/Twilio, Weather, Maps; feature-flag gated.

## Data Model (Initial)
- Core: `weddings`, `users`, `roles` (planner, vendor, guest), `events` (timeline), `rsvps`, `guests`, `vendors`.
- Media: `photos` (storage refs, EXIF, uploader), `photo_moments`, `embeddings` (pgvector, cosine similarity), `threads` (story sequences).
- Ops: `checkins` (QR/GPS), `messages`, `alerts`, `tasks`, `notifications`.
- Commerce (Phase 2): `payments`, `products`, `subscriptions`, `commissions`.

## Security & Compliance
- Auth: Supabase magic-link; role-based policies via RLS; per-wedding tenancy keys.
- Privacy: consent flags, data retention jobs (default 1-year), export/delete requests.
- Secrets: Netlify/Supabase-managed envs; never expose OpenAI keys client-side; edge-function only.

## MVP (Month 1–2)
- Wedding creation & management: CRUD UI, role assignments; secure routes.
- RSVP: Magic-link flows, multi-event RSVP, dietary restrictions.
- Photo upload & gallery: Mobile capture, upload to Supabase Storage, basic gallery with filters.
- AI photo analysis (initial): Edge Function to call OpenAI Vision, extract faces/objects/timestamps; store metadata and embeddings.
- Simple dashboard: wedding overview, RSVP stats, upload activity.

## Phase 1 (Month 3–4)
- AI Memory Archaeologist: duplicate moment detection, sentiment scoring, chronological threads for 8+ key events; batch processing (1,000+ photos, <30s/photo).
- Command Center: realtime timeline, vendor check-ins (QR + optional GPS), buffer alerts, weather integration, emergency alerts, role-based multi-user access.
- Guest messaging & live features: realtime messages, polls, interactive timeline; camera activation <3s.

## Phase 2 (Month 5–6)
- Predictive analytics: guest sentiment, density/movement, optimal photo moments, vendor performance; Recharts/D3 dashboards; PDF/CSV export.
- Revenue tools: AI lookbook, video montage pipeline, Printful integration, subscriptions; Stripe Connect for sharing.
- White-label: per-agency branding, custom domains; stronger PWA capabilities.

## Frontend Implementation
- Routing: `Landing`, `Dashboard`, `Wedding`, `Gallery`, `VendorPortal`, `Analytics` pages.
- State: lightweight state with React Query; cache invalidation on realtime events.
- PWA: service worker, offline RSVP/photo capture queue; push notifications for alerts.
- Accessibility & performance: WCAG 2.1 AA, <3s load on 3G; image lazy loading and responsive formats.

## Backend Implementation
- Supabase setup: Auth providers (email magic-link), Storage buckets (`wedding-photos`), pgvector, Realtime channels.
- Edge Functions: `analyze-photo` (OpenAI Vision), `create-embeddings`, `dedupe-moments`, `generate-threads`; job queue for batch processing.
- Webhooks: RSVP updates, check-ins, vendor arrivals; rate-limiting (1,000 req/hour) on public endpoints.
- Policies: RLS for tenant isolation by `wedding_id` and role; audit logging.

## Real-time & Performance
- <100ms latency targets via Supabase Realtime channels scoped by `wedding_id`.
- Batch and cache: dedupe uploads by content hash; cache OpenAI results; backpressure for large events.
- Image handling: client-side compression to <10MB; progressive uploads; EXIF parsing server-side.

## Integrations
- Email/SMS: SendGrid/Twilio for invites, alerts; templated campaigns.
- Maps/Weather: Google Maps for venue navigation; Weather.com API for outdoor planning.
- Calendar: Google/Outlook for timeline sync.

## Monitoring & CI/CD
- Observability: Sentry, LogRocket, GA; event-level metrics mapped to KPIs.
- CI/CD: Netlify deploys from GitHub; Supabase migrations via SQL migration scripts; preview environments.
- Error budgets: 99.9% uptime during events; load testing (10,000+ concurrent users).

## Success Criteria Mapping
- AI: 95% moment detection, 90% duplicate identification; <30s/photo.
- Guest: 85% RSVP completion, 70% photo participation, 90% satisfaction.
- Ops: reduce coordination calls by 80%; 500+ concurrent guests per event.
- Business: Stripe-based upsells averaging $500+ per wedding (Phase 2).

## Risks & Mitigations
- AI costs: batch, cache, content hashing; tiered model selection.
- Scalability: edge functions, CDN, rate-limits, backpressure.
- Privacy/compliance: periodic audits, DPA, RLS-first design; pen tests.

## Next Steps (Upon Approval)
- Initialize Supabase project, enable Auth/Storage/pgvector; create base schema & RLS policies.
- Add client Supabase SDK, auth flows, protected routes; photo upload UI and gallery.
- Implement `analyze-photo` edge function, store metadata/embeddings; basic thread view.
- Set up monitoring and deploy MVP to Netlify + Supabase.
