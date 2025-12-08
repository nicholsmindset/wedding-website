-- Create storage bucket for wedding photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-photos',
  'wedding-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
);

-- Create storage policies for wedding photos
CREATE POLICY "Users can upload photos to weddings they have access to" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'wedding-photos' AND
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id::text = (storage.foldername(name))[1]
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view photos for weddings they have access to" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'wedding-photos' AND
    EXISTS (
      SELECT 1 FROM wedding_roles
      WHERE wedding_roles.wedding_id::text = (storage.foldername(name))[1]
      AND wedding_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'wedding-photos' AND
    owner = auth.uid()
  );