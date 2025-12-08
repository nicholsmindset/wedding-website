-- Create invitation_tokens table for tracking RSVP magic links
CREATE TABLE invitation_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wedding_id, guest_id)
);

-- Create index for faster token lookups
CREATE INDEX idx_invitation_tokens_token ON invitation_tokens(token);
CREATE INDEX idx_invitation_tokens_email ON invitation_tokens(email);
CREATE INDEX idx_invitation_tokens_expires ON invitation_tokens(expires_at);

-- RLS Policies for invitation_tokens
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Allow wedding planners to manage invitation tokens
CREATE POLICY "Wedding planners can manage invitation tokens" ON invitation_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wedding_roles 
      WHERE wedding_roles.wedding_id = invitation_tokens.wedding_id 
      AND wedding_roles.user_id = auth.uid() 
      AND wedding_roles.role = 'planner'
    )
  );

-- Allow guests to view their own invitation tokens
CREATE POLICY "Guests can view their own invitation tokens" ON invitation_tokens
  FOR SELECT USING (
    guest_id IN (
      SELECT id FROM guests WHERE email = auth.email()
    )
  );