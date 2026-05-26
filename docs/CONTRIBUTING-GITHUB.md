# Contributing and GitHub

## First-time Git setup (this workspace)

From the repo root (`AIStudyCompanion`):

```powershell
git init
git branch -M main
git add .
git commit -m "Initial scaffold: Expo app, backend, schema, docs, CI"
```

## Create a GitHub repo and push

### Option A: GitHub CLI (recommended)

1. Install and authenticate [GitHub CLI](https://cli.github.com/) (`gh auth login`).
2. From the repo root:

```powershell
gh repo create AIStudyCompanion --private --source . --remote origin --push
```

Use `--public` instead of `--private` if you want a public portfolio repo.

### Option B: GitHub website + manual remote

1. Create an empty repo on GitHub (no README, no .gitignore).
2. Run:

```powershell
git remote add origin https://github.com/YOUR_USER/AIStudyCompanion.git
git push -u origin main
```

## Ongoing workflow

Commit after meaningful units of work (features, fixes, docs):

```powershell
git add .
git status
git commit -m "Short imperative description of the change."
git push
```

## Do not commit secrets

Keep Supabase keys and API keys **out** of commits. Copy `mobile/.env.example` to `mobile/.env` locally (the root `.gitignore` ignores `.env` files).
