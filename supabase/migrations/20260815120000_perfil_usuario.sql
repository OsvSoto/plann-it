ALTER TABLE public.usuario
  ADD COLUMN IF NOT EXISTS usuario_bio text,
  ADD COLUMN IF NOT EXISTS usuario_foto text;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'avatares',
  'avatares',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatares son publicos" ON storage.objects;
CREATE POLICY "Avatares son publicos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatares');

DROP POLICY IF EXISTS "Usuarios pueden crear su avatar" ON storage.objects;
CREATE POLICY "Usuarios pueden crear su avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatares'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su avatar" ON storage.objects;
CREATE POLICY "Usuarios pueden actualizar su avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatares'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatares'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Usuarios pueden eliminar su avatar" ON storage.objects;
CREATE POLICY "Usuarios pueden eliminar su avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatares'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
