-- Create storage bucket for bar assets (logos, etc)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bar-assets', 'bar-assets', true);

-- Create storage bucket for album covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('album-covers', 'album-covers', true);

-- Policies for bar-assets bucket
-- Anyone can view (public bucket)
CREATE POLICY "Public can view bar assets"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'bar-assets');

-- Admins can upload/update/delete any bar assets
CREATE POLICY "Admins can manage bar assets"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'bar-assets' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'bar-assets' AND public.has_role(auth.uid(), 'admin'));

-- Bar managers can upload to their bar's folder
CREATE POLICY "Bar managers can upload to their bar folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bar-assets' AND
  EXISTS (
    SELECT 1 FROM public.bar_managers bm
    WHERE bm.user_id = auth.uid()
    AND bm.bar_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Bar managers can update their bar assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bar-assets' AND
  EXISTS (
    SELECT 1 FROM public.bar_managers bm
    WHERE bm.user_id = auth.uid()
    AND bm.bar_id::text = (storage.foldername(name))[1]
  )
);

-- Policies for album-covers bucket
-- Anyone can view (public bucket)
CREATE POLICY "Public can view album covers"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'album-covers');

-- Admins can manage all album covers
CREATE POLICY "Admins can manage album covers"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'album-covers' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'album-covers' AND public.has_role(auth.uid(), 'admin'));

-- Bar managers can upload album covers for their bar's albums
CREATE POLICY "Bar managers can upload album covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'album-covers' AND
  EXISTS (
    SELECT 1 FROM public.bar_managers bm
    WHERE bm.user_id = auth.uid()
    AND bm.bar_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Bar managers can update album covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'album-covers' AND
  EXISTS (
    SELECT 1 FROM public.bar_managers bm
    WHERE bm.user_id = auth.uid()
    AND bm.bar_id::text = (storage.foldername(name))[1]
  )
);