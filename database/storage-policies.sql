-- Supabase Storage setup for Phase 2 uploads
-- Run in Supabase SQL editor after creating the `uploads` bucket (or use insert below).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  false,
  26214400, -- 25 MB
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path convention: {user_id}/{note_id}/{filename}

drop policy if exists "uploads_insert_own" on storage.objects;
create policy "uploads_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "uploads_select_own" on storage.objects;
create policy "uploads_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "uploads_update_own" on storage.objects;
create policy "uploads_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "uploads_delete_own" on storage.objects;
create policy "uploads_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);
