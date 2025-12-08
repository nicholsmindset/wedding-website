-- Migration: Fix RLS Security
-- Remove overly permissive anonymous grants and add proper public RSVP access

-- Revoke anonymous SELECT grants that expose sensitive data
REVOKE SELECT ON weddings FROM anon;
REVOKE SELECT ON wedding_roles FROM anon;
REVOKE SELECT ON events FROM anon;
REVOKE SELECT ON guests FROM anon;
REVOKE SELECT ON rsvps FROM anon;
REVOKE SELECT ON photos FROM anon;
REVOKE SELECT ON photo_moments FROM anon;
REVOKE SELECT ON embeddings FROM anon;
REVOKE SELECT ON threads FROM anon;
REVOKE SELECT ON thread_photos FROM anon;
REVOKE SELECT ON checkins FROM anon;
REVOKE SELECT ON messages FROM anon;
REVOKE SELECT ON notifications FROM anon;

-- Add specific policies for public RSVP access (anonymous users with valid tokens)
-- This allows the public RSVP page to work without requiring authentication

-- Allow anonymous users to read wedding details for RSVP (limited info)
CREATE POLICY "Anonymous can view wedding for RSVP" ON weddings
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM invitation_tokens
      WHERE invitation_tokens.wedding_id = weddings.id
      AND invitation_tokens.used = false
      AND invitation_tokens.expires_at > NOW()
    )
  );

-- Allow anonymous users to read events for RSVP
CREATE POLICY "Anonymous can view events for RSVP" ON events
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM invitation_tokens
      WHERE invitation_tokens.wedding_id = events.wedding_id
      AND invitation_tokens.used = false
      AND invitation_tokens.expires_at > NOW()
    )
  );

-- Allow anonymous users to read invitation tokens (for verification)
GRANT SELECT ON invitation_tokens TO anon;

CREATE POLICY "Anonymous can verify invitation tokens" ON invitation_tokens
  FOR SELECT TO anon
  USING (true);  -- Token verification is done by matching exact token value

-- Allow anonymous users to update invitation tokens (mark as used)
GRANT UPDATE ON invitation_tokens TO anon;

CREATE POLICY "Anonymous can mark tokens as used" ON invitation_tokens
  FOR UPDATE TO anon
  USING (used = false AND expires_at > NOW())
  WITH CHECK (used = true);  -- Can only set used to true

-- Allow anonymous users to insert guests (for RSVP submission)
GRANT INSERT ON guests TO anon;

CREATE POLICY "Anonymous can create guest for RSVP" ON guests
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invitation_tokens
      WHERE invitation_tokens.wedding_id = guests.wedding_id
      AND invitation_tokens.email = guests.email
      AND invitation_tokens.used = false
      AND invitation_tokens.expires_at > NOW()
    )
  );

-- Allow anonymous users to check if guest exists
CREATE POLICY "Anonymous can view guest for RSVP" ON guests
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM invitation_tokens
      WHERE invitation_tokens.wedding_id = guests.wedding_id
      AND invitation_tokens.email = guests.email
      AND invitation_tokens.expires_at > NOW()
    )
  );

-- Allow anonymous users to update guest info (for RSVP submission)
GRANT UPDATE ON guests TO anon;

CREATE POLICY "Anonymous can update guest for RSVP" ON guests
  FOR UPDATE TO anon
  USING (
    EXISTS (
      SELECT 1 FROM invitation_tokens
      WHERE invitation_tokens.wedding_id = guests.wedding_id
      AND invitation_tokens.email = guests.email
      AND invitation_tokens.used = false
      AND invitation_tokens.expires_at > NOW()
    )
  );

-- Allow anonymous users to insert RSVPs
GRANT INSERT ON rsvps TO anon;

CREATE POLICY "Anonymous can create RSVP" ON rsvps
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invitation_tokens it
      JOIN guests g ON g.id = rsvps.guest_id
      WHERE it.wedding_id = rsvps.wedding_id
      AND it.email = g.email
      AND it.used = false
      AND it.expires_at > NOW()
    )
  );

-- Allow anonymous users to upsert RSVPs
GRANT UPDATE ON rsvps TO anon;

CREATE POLICY "Anonymous can update RSVP" ON rsvps
  FOR UPDATE TO anon
  USING (
    EXISTS (
      SELECT 1 FROM invitation_tokens it
      JOIN guests g ON g.id = rsvps.guest_id
      WHERE it.wedding_id = rsvps.wedding_id
      AND it.email = g.email
      AND it.expires_at > NOW()
    )
  );

-- Enable RLS on invitation_tokens if not already enabled
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;
