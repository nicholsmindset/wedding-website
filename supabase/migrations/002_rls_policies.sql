-- Enable RLS on all tables
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Wedding policies
CREATE POLICY "Users can view weddings they have access to" ON weddings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = weddings.id
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create weddings" ON weddings
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update weddings they manage" ON weddings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = weddings.id
      AND wedding_roles.user_id = auth.uid()
      AND wedding_roles.role IN ('planner')
    )
  );

CREATE POLICY "Users can delete weddings they own" ON weddings
  FOR DELETE USING (auth.uid() = created_by);

-- Wedding roles policies
CREATE POLICY "Users can view roles for weddings they have access to" ON wedding_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles wr2
      WHERE wr2.wedding_id = wedding_roles.wedding_id
      AND wr2.user_id = auth.uid()
    )
  );

CREATE POLICY "Planners can manage roles for their weddings" ON wedding_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wedding_roles wr2
      WHERE wr2.wedding_id = wedding_roles.wedding_id
      AND wr2.user_id = auth.uid()
      AND wr2.role = 'planner'
    )
  );

-- Events policies
CREATE POLICY "Users can view events for weddings they have access to" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = events.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Planners can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = events.wedding_id
      AND wedding_roles.user_id = auth.uid()
      AND wedding_roles.role = 'planner'
    )
  );

-- Guests policies
CREATE POLICY "Users can view guests for weddings they have access to" ON guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = guests.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Planners can manage guests" ON guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = guests.wedding_id
      AND wedding_roles.user_id = auth.uid()
      AND wedding_roles.role = 'planner'
    )
  );

-- RSVPs policies
CREATE POLICY "Users can view RSVPs for weddings they have access to" ON rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = rsvps.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Planners can manage RSVPs" ON rsvps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = rsvps.wedding_id
      AND wedding_roles.user_id = auth.uid()
      AND wedding_roles.role = 'planner'
    )
  );

CREATE POLICY "Guests can update their own RSVPs" ON rsvps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM guests
      WHERE guests.id = rsvps.guest_id
      AND guests.email = auth.email()
    )
  );

-- Photos policies
CREATE POLICY "Users can view photos for weddings they have access to" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = photos.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload photos to weddings they have access to" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = photos.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own photos" ON photos
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Photo moments policies (read-only for users)
CREATE POLICY "Users can view photo moments for weddings they have access to" ON photo_moments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = photo_moments.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

-- Embeddings policies (read-only for users)
CREATE POLICY "Users can view embeddings for weddings they have access to" ON embeddings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = embeddings.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

-- Threads policies
CREATE POLICY "Users can view threads for weddings they have access to" ON threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = threads.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Planners can manage threads" ON threads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = threads.wedding_id
      AND wedding_roles.user_id = auth.uid()
      AND wedding_roles.role = 'planner'
    )
  );

-- Thread photos policies
CREATE POLICY "Users can view thread photos for weddings they have access to" ON thread_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = (
        SELECT wedding_id FROM threads WHERE threads.id = thread_photos.thread_id
      )
      AND wedding_roles.user_id = auth.uid()
    )
  );

-- Checkins policies
CREATE POLICY "Users can view checkins for weddings they have access to" ON checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = checkins.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own checkins" ON checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages for weddings they have access to" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = messages.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to weddings they have access to" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id = messages.wedding_id
      AND wedding_roles.user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON weddings TO anon;
GRANT SELECT ON wedding_roles TO anon;
GRANT SELECT ON events TO anon;
GRANT SELECT ON guests TO anon;
GRANT SELECT ON rsvps TO anon;
GRANT SELECT ON photos TO anon;
GRANT SELECT ON photo_moments TO anon;
GRANT SELECT ON embeddings TO anon;
GRANT SELECT ON threads TO anon;
GRANT SELECT ON thread_photos TO anon;
GRANT SELECT ON checkins TO anon;
GRANT SELECT ON messages TO anon;
GRANT SELECT ON notifications TO anon;

GRANT ALL ON weddings TO authenticated;
GRANT ALL ON wedding_roles TO authenticated;
GRANT ALL ON events TO authenticated;
GRANT ALL ON guests TO authenticated;
GRANT ALL ON rsvps TO authenticated;
GRANT ALL ON photos TO authenticated;
GRANT ALL ON photo_moments TO authenticated;
GRANT ALL ON embeddings TO authenticated;
GRANT ALL ON threads TO authenticated;
GRANT ALL ON thread_photos TO authenticated;
GRANT ALL ON checkins TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON notifications TO authenticated;