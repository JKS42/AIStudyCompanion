# 08 - Upload and storage setup (Phase 2)

## 1) Run storage policies

After applying [`database/schema.sql`](../database/schema.sql), run [`database/storage-policies.sql`](../database/storage-policies.sql) in the Supabase SQL editor.

This creates the private `uploads` bucket and RLS policies so users can only access files under their own `{user_id}/` folder.

## 2) Verify bucket settings

In Supabase Dashboard → **Storage → uploads**:

- Bucket should be **private**
- Max file size: **25 MB**
- Allowed MIME types: PDF, JPEG, PNG, WebP, MP3, WAV

## 3) Mobile flows

| Flow | Behavior |
|------|----------|
| Typed note | Saved directly to `notes` with `status = ready` |
| PDF / image / audio | Creates `notes` row (`processing`), uploads to Storage, inserts `uploaded_files`, sets `status = uploaded` |
| Failed upload | Note marked `failed`; user can tap **Retry upload** in Library |
| Cancel | Cancels in-progress upload from Upload screen |

## 4) Path convention

Storage paths: `{user_id}/{note_id}/{filename}`

## 5) Test checklist

- [ ] Upload a PDF under 25 MB
- [ ] Upload an image from gallery
- [ ] Upload an audio file
- [ ] Save a typed note
- [ ] See items in Library with correct status badges
- [ ] Pull to refresh library list
- [ ] Retry a failed upload
- [ ] Cancel an in-progress upload

## 6) Troubleshooting

| Error | Fix |
|-------|-----|
| `new row violates row-level security` | Confirm user is authenticated and `profiles` row exists |
| Storage upload forbidden | Re-run `storage-policies.sql`; check path starts with `auth.uid()` |
| File too large | Use files under 25 MB |
| Unsupported file type | Use PDF, JPEG, PNG, WebP, or audio formats listed above |
