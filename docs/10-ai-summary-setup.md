# 10 - AI summary setup (Phase 3)

## 1) Backend environment

Copy `backend/.env.example` to `backend/.env` and set:

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | Yes | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side note/file access |
| `OPENAI_API_KEY` | No | Real LLM summaries (fallback used if missing) |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini` |
| `SUMMARY_TIMEOUT_MS` | No | Default `45000` |

Start the API:

```bash
cd backend
npm install
npm run dev
```

Health check: `GET http://localhost:8787/health`

Latency metrics (dev): `GET http://localhost:8787/api/ai/metrics`

## 2) Mobile API URL

Copy `mobile/.env.example` to `mobile/.env` and add:

```env
EXPO_PUBLIC_API_URL=http://localhost:8787
```

**Android emulator** — use the host loopback alias:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8787
```

**Physical device on same Wi‑Fi** — use your PC LAN IP, e.g. `http://192.168.1.10:8787`.

## 3) Supported content for summarization

| Source | Extraction |
|--------|------------|
| Typed note | Uses `notes.raw_text` |
| PDF | Text extracted server-side (`pdf-parse`) |
| Image / audio | Not yet — shows a clear error; use typed or PDF |

Summaries are stored in `summaries` with `prompt_version`, `model_used`, and token counts.

## 4) Mobile flows

| Flow | Behavior |
|------|----------|
| Open note | Library → tap a note card |
| Generate | Note detail → **Generate summary** |
| Regenerate | **Regenerate** creates a new row (force) |
| Cached | Re-opening without regenerate returns the latest saved summary |
| Timeout | User sees a readable error after ~45s |

## 5) Test checklist

- [ ] Backend `/health` returns `ok: true`
- [ ] Generate summary for a typed note
- [ ] Generate summary for a text-based PDF
- [ ] Regenerate produces a new summary version
- [ ] Token counts appear on the summary card
- [ ] `/api/ai/metrics` shows `p95Ms` after several runs
- [ ] Image/audio note shows a helpful “not supported yet” error

## 6) Troubleshooting

| Error | Fix |
|-------|-----|
| `Request timed out` | Start backend; check `EXPO_PUBLIC_API_URL` |
| `Network request failed` (emulator) | Use `10.0.2.2` instead of `localhost` |
| `Unauthorized` | Sign out and back in; token expired |
| `Note not found` | Confirm note belongs to signed-in user |
| `Could not extract enough text from PDF` | Use a text-based PDF or typed notes |
| Fallback model only | Add `OPENAI_API_KEY` to `backend/.env` |
