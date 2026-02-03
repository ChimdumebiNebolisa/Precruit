# Precruit MVP – Milestones (Execution-Ready)

Execution-ready milestone plan derived from the canonical spec: [docs/spec/Precruit.md](../spec/Precruit.md).

Last updated: February 3, 2026

---

## Overview

### MVP scope

- **Goal**: Track-specific traffic-light status per company and notify users when a chosen track flips status or when a relevant internship posting appears.
- **Users**: US-based internship seekers (college students) targeting CS-related roles (SWE, SRE, infra/platform, PM).
- **Stack**: Next.js + TypeScript (apps/web), Supabase (Postgres + Auth), GitHub Actions cron (scheduled runs), Resend (email alerts).
- **Seed**: Manually curated list in `data/companies_seed.csv`; no automated startup discovery.

### Four tracks

| Track | Includes (examples) | Exclude (examples) |
| --- | --- | --- |
| SWE Intern | Software Engineer, Backend, Frontend, Fullstack, Mobile | Senior, Staff, Principal, Manager |
| Infra and Platform Intern | Platform, Infrastructure, DevOps, Build/Release, CI/CD | IT Helpdesk, Facilities |
| SRE Intern | SRE, Site Reliability, Reliability Engineering | Senior, Staff, Manager |
| Product Intern | Product Manager Intern, Technical PM, TPM | Marketing PM, Sales roles |

### Posted-now vs prediction rule

- **Posted now**: Boolean badge. When at least one relevant internship posting is live for that track at that company, set `PostedNow = true` and show a “Posted” badge. This is current state, not a prediction.
- **Traffic-light (prediction)**: Applies when no relevant posting is live. Represents likelihood of a relevant posting within 30 days. When a posting is live, still compute and store the prediction score; UI emphasizes “Posted” badge; traffic-light remains for context (e.g. “likely to stay open”).

### Success metrics (MVP)

- **Precision**: % of Green predictions (per track) that result in at least one relevant posting within 30 days.
- **Lead time**: Median days between first Green and first relevant posting.
- **User value**: Shortlist saves and alert opt-ins (early traction).

---

## Milestones table

| Milestone | Goal | Exit criteria | Key deliverables | Risks | Out of scope |
|-----------|------|---------------|------------------|-------|--------------|
| **M1** | Track seed list and detect ATS | All seed companies in DB; ats_type set per company (Greenhouse, Lever, Ashby, or unknown where not detectable); endpoint stored when a supported ATS is detected | Seed import script/job; ATS detection logic; companies + ATS metadata in Supabase | ATS detection false negatives; careers_url missing | New company discovery; scraping protected sources; ML-based ATS detection |
| **M2** | Daily snapshots and track classification | Daily cron fetches postings; postings classified into 4 tracks; snapshot persisted | GitHub Actions cron workflow; ATS adapters (fetch); posting→track classification; snapshot tables | API rate limits; title noise; endpoint changes | Real-time feeds; more than 4 tracks; resume/application tracking |
| **M3** | Scoring, UI, and alerts | Per-track score + traffic-light + PostedNow; company list/detail/shortlist pages; email on status change or new posting | Rubric scoring; top 2–3 signals stored; list/detail/filters; shortlist + Resend alerts | Email deliverability; over-scoping UI | Weight changes without spec+changelog; Vercel Cron as default; automated company discovery |

---

## M1: Track seed list and detect ATS

**Goal**: Import the curated company list and determine ATS type (and endpoint) per company.

### (a) Data model impacts

- **`companies`** (or equivalent): `id` (UUID), `company_name`, `website_url`, `careers_url` (nullable), `ats_type` (enum or text: `Greenhouse` | `Lever` | `Ashby` | `unknown`), `ats_board_url` or `ats_endpoint` (nullable), `location` (nullable), `created_at`, `updated_at`. RLS: read for authenticated users; write for service/cron only if needed.
- **Placeholder**: Optional `ats_detection_log` or `raw_ats_metadata` (JSONB) for debugging; not required for MVP.
- **Seed source**: `data/companies_seed.csv` columns: `company_name`, `website_url`, `careers_url`, `ats_type`, `location` (ats_type empty on import; filled by detection).

### (b) Ingestion tasks

- **ATS detection**: Best-effort only. For each company, resolve ATS from careers_url or website_url (e.g. known Greenhouse/Lever/Ashby URL patterns or lightweight probe of public job board endpoints). Set `unknown` when not detectable; that is normal for companies not on a supported ATS. No scraping of protected or terms-violating sources.
- **Token extraction**: Not required in M1; focus on identifying vendor and storing board/API endpoint URL.
- **Fetch cadence**: One-time (or on-demand) import from CSV; no recurring fetch in M1.

### (c) Scoring tasks

- None in M1. Scoring starts in M2/M3.

### (d) UI tasks

- Optional: minimal “Companies” or “Seed status” view showing company name, ATS type, and detection status. Not required for exit; can be internal/debug.

### (e) Alerting tasks

- None in M1.

### (f) Testing / validation checklist

- **Unit**: ATS detection function returns correct type for known Greenhouse/Lever/Ashby URLs; returns `unknown` for unrecognized URLs.
- **Integration**: Run import against `companies_seed.csv`; all rows present in DB; `ats_type` and endpoint populated where detectable.
- **Fixtures**: Small CSV (2–3 rows) with one known Greenhouse, one known Lever, one unknown; assert DB state after import.

### (g) Observability checklist

- Log count of companies imported and count per `ats_type`.
- Log failures (e.g. invalid URL, fetch error) without blocking full import.
- No health-check endpoint required for M1.

---

## M2: Daily snapshots and track classification

**Goal**: Fetch postings daily from supported ATS endpoints, classify postings into the four tracks, and persist a daily snapshot and postings only. Per-track status (traffic-light + Posted badge) is computed in M3 and persisted in `company_track_scores`.

### (a) Data model impacts

- **`postings_snapshot`** (or `daily_snapshots`): `id`, `company_id`, `snapshot_date` (date), `raw_response` or `postings_payload` (JSONB, optional), `created_at`. Ensures one snapshot per company per day for cron run.
- **`postings`** (or equivalent): `id`, `company_id`, `snapshot_id`, `external_id`, `title`, `department`/`commitment` (if available), `track` (enum: SWE Intern | Infra and Platform Intern | SRE Intern | Product Intern), `posted_at` (if available), `url`, `created_at`. Enables “Posted now” and track-level aggregation.
- **Per-track status**: Not materialized in M2. M2 persists snapshots and postings only. Per-track status (traffic-light + Posted badge) is computed in M3 and persisted in `company_track_scores`.
- **Track classification**: Stored on each posting row; classification rules based on title keywords and ATS fields (e.g. commitment/department) per spec §4.

### (b) Ingestion tasks

- **ATS detection**: Reuse M1; no new sources in M2.
- **Token extraction**: Parse job title and ATS-specific fields (department, commitment, etc.) from API responses; apply track keyword rules to assign `track`.
- **Fetch cadence**: Daily via GitHub Actions cron; single run over seed list; fetch from Greenhouse/Lever/Ashby endpoints only (public job board APIs).

### (c) Scoring tasks

- **M2**: Do not persist per-track status. `posted_now` and traffic-light are computed in M3 from snapshots and postings.

### (d) UI tasks

- Optional: “Snapshot status” or “Last run” indicator. Not required for M2 exit; company list/detail UI in M3.

### (e) Alerting tasks

- None in M2. Alerts in M3.

### (f) Testing / validation checklist

- **Unit**: Track classification returns correct track for sample titles (e.g. “Software Engineer Intern” → SWE Intern; “SRE Intern” → SRE Intern); excludes “Senior Software Engineer”.
- **Integration**: Cron (or manual trigger) fetches from a test company with known Greenhouse board; postings and snapshot rows created; track assigned correctly.
- **Fixtures**: Mock ATS API response (Greenhouse/Lever/Ashby) with 1–2 jobs; assert snapshot + postings rows and track values.

### (g) Observability checklist

- Log per-company fetch success/failure; log snapshot_date and posting count per company.
- Basic health check: cron job reports success/failure (e.g. exit code or log aggregation).
- Failure mode: one company failure does not abort entire run; failures logged for retry or manual review.

---

## M3: Scoring, UI, and alerts

**Goal**: Compute per-track score and traffic-light using the rubric, build company list + detail + shortlist, and send email alerts on status change or new relevant posting.

### (a) Data model impacts

- **`company_track_scores`** (or equivalent): `company_id`, `track`, `snapshot_date` (or `computed_at`), `prediction_score` (0–100), `traffic_light` (Green|Yellow|Orange|Red), `posted_now` (boolean), `top_signals` (JSONB or array: 2–3 signal descriptions). Unique per (company_id, track, snapshot_date).
- **`shortlists`**: `id`, `user_id` (references auth.users), `company_id`, `created_at`. RLS: user can only CRUD own rows.
- **`shortlist_tracks`** (or embedded): Which tracks the user watches per shortlisted company (e.g. `shortlist_id`, `track`). Enables “notify me for this track.”
- **`alert_preferences`** or **`subscriptions`**: `user_id`, `company_id`, `track` (optional), preference: “status_change” and/or “new_posting”; `last_notified_at` (optional, secondary to alert_log for deduplication).
- **`alert_log`**: `id`, `user_id`, `company_id`, `track`, `event_type` (status_change | new_posting), `snapshot_date` (for status_change), `posting_external_id` (for new_posting), `sent_at`. Required for idempotency: check or insert before sending; at most one email per key (status change: user_id, company_id, track, event_type, snapshot_date; new posting: user_id, company_id, track, event_type, posting_external_id).

### (b) Ingestion tasks

- Reuse M2 daily cron; no new ingestion sources. Ensure snapshot and postings data are available for scoring run after fetch.

### (c) Scoring tasks

- **Rubric application**: For each (company, track), compute score from spec §7.1: relevant posting live 100 pts; ATS board exists 0 postings 15; ATS metadata change 0 postings 25; adjacent track new posting 10; careers content change 5; known ATS 5. Cap at 100.
- **Thresholds**: 80–100 Green, 50–79 Yellow, 20–49 Orange, 0–19 Red (spec §7.2). Store `traffic_light` and `prediction_score`.
- **Posted-now**: Set `posted_now = true` when any relevant posting exists for that track; still compute and store score.
- **Top signals**: Persist top 2–3 signals that contributed to the score (e.g. “Relevant posting live”, “ATS metadata change”).

### (d) UI tasks

- **Company list**: Search and filter by track, location (optional), traffic-light status; show “Posted” badge when `posted_now` is true for selected track.
- **Company detail**: Per-track status (traffic-light + Posted badge), from `company_track_scores`; top signals (reasons), small history timeline (optional: previous traffic-light or snapshot dates).
- **Shortlist**: Save companies; pick tracks to watch; show shortlist view.
- **Filters**: Track, location, status (Green/Yellow/Orange/Red), Posted now.

### (e) Alerting tasks

- **Events**: (1) Status change event: traffic-light change for a watched company+track (e.g. Green→Yellow, Red→Green). (2) New posting event: a relevant posting appears for a watched company+track.
- **Idempotency keys**: Status change = (user_id, company_id, track, event_type=status_change, snapshot_date). New posting = (user_id, company_id, track, event_type=new_posting, posting_external_id). At most one email per key.
- **Email**: Send via Resend; respect shortlist track preferences. Before sending, check or insert into `alert_log`; skip send if a row for that key already exists. At most one email per key (see idempotency keys above).
- **Guardrail**: Shortlist subscription triggers email only on state change or new postings; no spam. last_notified_at is optional and secondary.

### (f) Testing / validation checklist

- **Unit**: Score calculation for known signal sets yields expected total and traffic-light; top 2–3 signals correctly chosen.
- **Integration**: Company with Green status and shortlisted user receives email on transition to Yellow; company with new SWE Intern posting triggers “new posting” email for subscribers watching SWE Intern.
- **Fixtures**: Sample `company_track_scores` rows; assert list filters and detail page show correct badges and labels.

### (g) Observability checklist

- Log score run: companies processed, any errors.
- Health check: API route or cron step that returns 200 when DB and critical paths are reachable.
- Failure modes: Resend failure logged and optionally retried; no silent drop of alerts.

---

## Acceptance tests (concrete scenarios)

1. **Company with Greenhouse board and live SWE Intern posting**
   - **Setup**: One company in seed with Greenhouse careers URL; Greenhouse board returns at least one job with title matching SWE Intern track.
   - **Assert**: `posted_now = true` for that company + SWE Intern track; “Posted” badge shown on company list and detail for SWE Intern; track classification is SWE Intern; prediction score still computed and stored; traffic-light may be Green (e.g. 100 pts) but UI emphasizes “Posted.”
   - **Alert**: If a user has shortlisted this company and watches SWE Intern, they receive an email when this posting first appears (new posting event).

2. **Company with 0 postings in track but ATS metadata change**
   - **Setup**: Company has Greenhouse board; no current postings in a given track; previous snapshot had different departments/offices or metadata; current snapshot has metadata change.
   - **Assert**: Scoring applies rubric (e.g. “ATS metadata change, 0 postings in track” → 25 pts); other applicable signals summed; score and traffic-light stored; top 2–3 signals (including “ATS metadata change”) recorded; no “Posted” badge for that track.

3. **Shortlist subscription: email only on state change and new postings**
   - **Setup**: User shortlists Company A and selects “SWE Intern” and “Product Intern” to watch.
   - **Assert**: User receives email when (a) Company A’s SWE Intern status changes (e.g. Red → Green) or (b) a new SWE Intern or Product Intern posting appears for Company A. User does not receive an email when nothing changed (e.g. same status and no new postings). At most one email per idempotency key (status change: user_id, company_id, track, event_type=status_change, snapshot_date; new posting: user_id, company_id, track, event_type=new_posting, posting_external_id).

---

## Non-negotiable guardrails

- **No scraping protected sources**: Only use public job board APIs (Greenhouse, Lever, Ashby) and compliant lightweight checks. Do not scrape sites that prohibit it or violate terms of use.
- **Scoring weights**: Do not change point values or score-to-traffic-light thresholds without (a) updating [docs/spec/Precruit.md](../spec/Precruit.md) and (b) appending a dated entry to [docs/spec/weights_changelog.md](../spec/weights_changelog.md).
- **Cron default**: GitHub Actions cron is the MVP default for scheduled ingestion/scoring. Vercel Cron or other schedulers are out of scope as equal default for MVP.
- **No automated startup discovery**: Company list is manual only. Seed list is `data/companies_seed.csv`; no automated discovery or bulk import from external directories.

---

## Repo mapping

| Responsibility | Location |
|----------------|----------|
| Next.js app, pages, UI, API routes | `apps/web/` |
| Database schema and migrations | `supabase/migrations/` |
| Seed company list (manual) | `data/companies_seed.csv` |
| Canonical spec, rubric, thresholds, weights changelog | `docs/spec/` (e.g. `Precruit.md`, `weights_changelog.md`) |
| Milestone and delivery docs | `docs/milestones/` (e.g. this file) |
| One-off or recurring scripts (e.g. seed import, cron entrypoint) | `scripts/` (if present or planned) |

Note: MVP keeps logic in `apps/web` (e.g. API routes, serverless) or scripts; `packages/core` and `packages/ingest` are future and not required for MVP.
