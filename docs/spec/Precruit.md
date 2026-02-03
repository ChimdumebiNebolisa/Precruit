**Precruit MVP Spec**

_Role-specific early hiring signals for internship hunters (US startups)_

Last updated: February 3, 2026

# 1. Problem and goal

College students hunting internships waste time chasing companies only after roles are posted. They want a short list of companies that are likely to open CS-related internship roles soon, plus alerts when signals change.

MVP goal: Provide track-specific traffic-light status per company and notify users when a chosen track flips status or posts a relevant internship role.

# 2. Target user

- Primary: US-based internship seekers (college students) targeting CS roles.
- Behavior: build shortlists, cold email early, apply fast when postings appear.
- Constraint: they need clarity by role type, not generic company hiring.

# 3. Scope and constraints

- Geography: US-based companies and/or US-eligible roles.
- Company type: private startups (initially seeded from a curated directory list).
- Company size (guideline): roughly 10 to 300 employees.
- Prediction horizon: 30 days.
- Definition of success event: at least one relevant internship posting appears for a track within 30 days of a Green prediction.

Non-goals (MVP):

- Perfect predictions or ML-based modeling.
- Universal coverage of all startups or all ATS vendors.
- Scraping protected sources (avoid anything that violates platform terms).
- Applicant tracking, resume parsing, or automated applications.

# 4. Tracks (role buckets)

Start with 4 tracks for MVP. Users can toggle what they care about.

| Track | Includes (examples) | Exclude (examples) |
| --- | --- | --- |
| SWE Intern | Software Engineer, Backend, Frontend, Fullstack, Mobile | Senior, Staff, Principal, Manager |
| Infra and Platform Intern | Platform, Infrastructure, DevOps, Build/Release, CI/CD | IT Helpdesk, Facilities |
| SRE Intern | SRE, Site Reliability, Reliability Engineering | Senior, Staff, Manager |
| Product Intern | Product Manager Intern, Technical PM, TPM | Marketing PM, Sales roles |

# 5. User experience

## 5.1 Core pages

- Company list: search and filter by track, location (optional), and traffic-light status.
- Company detail: per-track status (traffic-light + Posted badge), reasons (top signals), and a small history timeline.
- Shortlist: save companies and pick tracks to watch.
- Alerts: email notifications when a tracked company changes status for a chosen track, or when a relevant posting appears.

## 5.2 Posted now vs prediction status

**Rule:** "Posted now" is a boolean badge, independent of the traffic-light. The traffic-light applies only to likelihood within 30 days when no relevant posting is live.

- **Posted now**: A boolean badge, independent of the traffic-light. When at least one relevant internship posting is live for that track at that company, set `PostedNow = true` and show a "Posted" badge in the UI. This is not a prediction—it is current state.
- **Traffic-light (prediction)**: Applies only when no relevant posting is currently live. It represents likelihood of a relevant posting appearing within 30 days. When a posting is live, still compute and store the prediction score for consistency, but the UI emphasizes the "Posted" badge; the traffic-light remains informative (e.g. for "likely to stay open" or future roles).

## 5.3 Traffic-light meaning (per track, when no posting is live)

- Green: signals suggest likely posting within 30 days.
- Yellow: mixed signals, monitor.
- Orange: weak signals, low priority.
- Red: no evidence of near-term posting.

# 6. Data sources (MVP)

MVP backbone is public job board feeds from common ATS platforms. These are designed to expose published postings and metadata.

- Greenhouse Job Board API (offices, departments, published jobs).
- Lever Postings API (filterable postings feed).
- Ashby public job posting API (published postings feed).

Optional (later): fundraising proxy from SEC Form D filings, only if it is easy to integrate without paid vendors.

# 7. Signals and scoring

Start with a simple, explainable rubric. Iterate after measuring precision.

## 7.1 Initial scoring rubric (MVP)

Use the following points per company per track. For MVP, use only these point values; do not add or change weights without updating the spec. Total score 0–100; then map to traffic-light via thresholds below.

| Signal | Points (max) | Notes |
| --- | --- | --- |
| Relevant posting live for track | 100 (immediate) | If true: set PostedNow=true; score still computed for record. |
| ATS board exists, 0 postings in track | 15 | Candidate for early signals. |
| ATS metadata change (e.g. new departments/offices), 0 postings in track | 25 | Suggests hiring activity. |
| Recent new posting in adjacent track (e.g. full-time SWE) | 10 | Weak signal; company is hiring. |
| Careers page content change (optional) | 5 | Basic HTML change detection. |
| Known ATS type detected | 5 | Greenhouse/Lever/Ashby; enables future signals. When ats_type is unknown, this signal contributes 0 points (not an error). |

- **Track relevance**: Determined by title keyword rules and ATS fields when available (e.g. commitment filters).
- **Score**: Sum of applicable points, capped at 100. Store top 2–3 signals that drove the score.

## 7.2 Score-to-traffic-light thresholds (MVP)

| Score range | Label |
| --- | --- |
| 80–100 | Green |
| 50–79 | Yellow |
| 20–49 | Orange |
| 0–19 | Red |

## 7.3 Posted-now rule

If a relevant posting is live for the track: set `PostedNow = true`, still compute and store `PredictionScore`, and show the "Posted" badge in the UI. The traffic-light may still be shown for context but the primary user signal is "Posted."

## 7.4 Scoring weight changes

Any change to point values or thresholds requires:

- **(a)** Updating the spec rubric/thresholds (this document).
- **(b)** Adding a dated entry to `docs/spec/weights_changelog.md`.

Do not change weights without both; otherwise metrics become incomparable.

# 8. Seed list (MVP)

- **Source**: Manually curated list for MVP. No automated discovery.
- **Location**: `data/companies_seed.csv`. The file is created with headers only and is manually populated; the list is manually curated for MVP.
- **Columns**:

| Column | Description |
| --- | --- |
| company_name | Display name of the company. |
| website_url | Main company website. |
| careers_url | Careers or jobs page URL (optional; may be detected later). |
| ats_type | Empty on import; filled after ATS detection: `Greenhouse`, `Lever`, `Ashby`, or `unknown`. |
| location | Optional; e.g. city, region, or "Remote". |

- **ATS detection**: Best-effort only. `unknown` is a normal, expected outcome for companies not using Greenhouse, Lever, or Ashby.
- **Ingestion**: MVP loads this CSV (e.g. via script or one-time import); no automated sync of the list itself.

# 9. Architecture and tech stack

## 9.1 Frontend

- Next.js + TypeScript
- Simple UI components, mobile-friendly list views, fast filters

## 9.2 Backend and jobs

- Next.js API routes (or a small Node/TypeScript service) for ingestion and scoring.
- **Scheduled runs (MVP)**: GitHub Actions cron (e.g. daily). Single default for MVP to avoid ambiguity. Vercel Cron is a later optional alternative, not an equal choice for MVP.
- HTTP fetch to ATS endpoints; optional lightweight HTML fetch for careers page.

## 9.3 Database and auth

- Supabase Postgres for persistence
- Supabase Auth (email magic link) for login

## 9.4 Notifications

- Resend (or similar) for transactional email alerts.
- **Alert events**: (1) Status change for a watched company+track. (2) New relevant posting for a watched company+track.
- **Alert idempotency**: At most one email per idempotency key. Keys: status change = (user_id, company_id, track, event_type=status_change, snapshot_date); new posting = (user_id, company_id, track, event_type=new_posting, posting_external_id). Implementation must check or insert into `alert_log` before sending. `last_notified_at` is optional and secondary.

# 10. MVP delivery plan

## Milestone 1: Track a seed list and detect ATS (week 1)

- Import the curated company list from `data/companies_seed.csv`.
- Detect ATS type per company (Greenhouse, Lever, Ashby, or unknown).
- Store ATS endpoint and basic company metadata.

## Milestone 2: Daily snapshots and track classification (week 1 to 2)

- Fetch postings daily from supported ATS endpoints (triggered by GitHub Actions cron).
- Classify postings into tracks using title rules and ATS fields when available.
- Persist a daily snapshot and postings only. Per-track status is computed and persisted in Milestone 3.

## Milestone 3: Scoring, UI, and alerts (week 2)

- Compute per-track score and traffic-light label using the rubric and thresholds above.
- Build company list + company detail pages with filters.
- Add shortlist + email alerts for status changes and new relevant postings.

# 11. Success metrics (MVP)

- Precision: % of Green predictions (per track) that result in at least one relevant posting within 30 days.
- Lead time: median days between first Green and first relevant posting.
- User value: shortlist saves and alert opt-ins (early traction).

# 12. Key risks and mitigations

- Coverage risk: many companies may not use supported ATS vendors. Mitigation: start with vendors that have clear public feeds and expand later.
- Title noise: internships can be labeled inconsistently. Mitigation: keep track keywords small and iterate with real examples.
- Data instability: endpoints can change. Mitigation: vendor-specific adapters and health checks.
- Over-scoping: too many tracks and signals. Mitigation: 4 tracks max in MVP, ATS-first signals only.

# 13. References (public docs)

- Greenhouse Job Board API: <https://developers.greenhouse.io/job-board.html>
- Lever Postings API (community docs): <https://github.com/lever/postings-api>
- Ashby Public Job Posting API: <https://developers.ashbyhq.com/docs/public-job-posting-api>
- GitHub Actions: scheduled workflows (cron)
- SEC Form D overview: <https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/what-form-d>
