# Precruit
## AI-Powered Internship Hiring Window Signals

### Hackathon MVP Specification

---

## 1. What This Product Is

Precruit is a public, no-login web app that shows which US companies are likely to enter a technical + product internship hiring window within the next 30 days.

- It does **not** show job listings.
- It does **not** send alerts.
- It does **not** claim certainty.

It is a pre-alert system that helps students and early-career candidates time their applications before postings appear.

---

## 2. Core User Experience

### Landing Flow

- User visits the website.
- They immediately see a list of companies.
- Each company displays:
  - AI-predicted likelihood (0–100%)
  - Traffic light (Green / Yellow / Orange / Red)
  - A short neutral explanation
  - A short AI-generated reason for the prediction
- No account. No onboarding. No friction.

---

## 3. Meaning of Traffic Lights (Locked)

Traffic lights are derived from an AI-predicted probability.

| Light   | Range   | Message |
|---------|---------|---------|
| **Green**  | ≥ 60%  | "This company shows strong hiring activity and may enter an internship window in the next 30 days." |
| **Yellow** | 40–59% | "This company shows moderate hiring activity. An internship window is possible." |
| **Orange** | 20–39% | "This company shows limited recent hiring activity." |
| **Red**     | &lt; 20% | "No significant hiring activity detected." |

**Important:** Green means likely within the next 30 days. This language must be visible in the UI.

---

## 4. What Is Being Predicted (Conceptual Model)

### Prediction Target

Whether a company is likely to open a **technical or product internship hiring window** within the next 30 days.

### What Counts as "Technical + Product Intern"

- Software Engineering Intern
- Data / ML Intern
- Security / Infra / DevOps Intern
- Product Manager Intern

Intern titles are **not** used for prediction. They are only used later (outside the hackathon MVP) to validate outcomes.

---

## 5. AI Integration (Core Hackathon Requirement)

### Why AI Is Used

AI is responsible for the **core prediction**, not just UI text.

The model:

- receives structured hiring signals
- outputs a probability (0–100%)
- explains its reasoning in plain language

This satisfies the requirement that AI be integral to product logic, not decorative.

### AI Platform

**DigitalOcean Gradient™ AI**

For this MVP, **Serverless Inference** is the required integration path (not Agents, knowledge bases, or evaluation APIs).

Relevant build docs:

- DigitalOcean Serverless Inference: https://docs.digitalocean.com/products/gradient-ai-platform/how-to/use-serverless-inference/
- DigitalOcean Available Models: https://docs.digitalocean.com/products/gradient-ai-platform/details/models/
- OpenAI SDK compatibility with DO Serverless Inference: https://www.digitalocean.com/community/tutorials/serverless-inference-openai-sdk

Platform provider: **DigitalOcean**

#### Serverless Inference Implementation (Locked for MVP)

- Base URL (HTTP): https://inference.do-ai.run
- Base URL (OpenAI SDK `base_url`): https://inference.do-ai.run/v1/
- Endpoints:
  - GET /v1/models
  - POST /v1/chat/completions
- Auth header: Authorization: Bearer <MODEL_ACCESS_KEY>
- Config:
  - MODEL_ACCESS_KEY must be loaded from environment variables
  - MODEL_ID must be selected from the response of GET /v1/models and written into config before running. It must remain pinned to a single value for the MVP.
- Note:
  - If provider terms acceptance is required in the DigitalOcean console, accept them before running the app

These endpoint details must match DigitalOcean's Serverless Inference docs. The base URL and endpoint list are defined there.

#### Inference and Caching (Locked)

- Do not call the AI on every filter, search, or UI re-render.
- Compute once per company per server process and cache in memory.
- Cache key must include company id (or slug) plus a stable hash of the signal values.
- UI interactions must only filter and sort cached results.

---

## 6. Signals Used (Mocked for MVP, Realistic by Design)

All signals represent **non-intern** hiring behavior, so prediction happens before intern postings exist.

Each company has the following boolean inputs:

| Signal | Description |
|--------|-------------|
| `hiring_spike_7d` | Multiple new roles posted recently |
| `eng_hiring_14d` | New full-time engineering roles posted recently |
| `churn_14d` | Roles opening and closing (active hiring motion) |
| `early_career_language` (optional) | Mentions of early-career or campus hiring language |

These values are hard-coded for the hackathon MVP but designed to be replaceable by real ATS data later.

---

## 7. AI Prediction Contract

### Model Input (per company)

Structured text describing recent hiring activity.

**Example (conceptual):**

```
Company: Acme Corp
Recent hiring signals:
- hiring_spike_7d: true
- eng_hiring_14d: true
- churn_14d: false
- early_career_language: true

Task:
Predict the probability (0–100%) that this company will enter a technical or product internship hiring window in the next 30 days.

Output must match the canonical JSON schema defined in the "Strict Schema Requirement" subsection below.
```

### Model Output

- **probability** → drives the traffic light
- **reason** → shown directly in the UI

### Strict Schema Requirement

Return JSON only, no markdown, no extra keys:

```json
{
  "probability": <integer 0-100>,
  "reason": "<one sentence>"
}
```

### Output Robustness Rules (Locked)

- The server must validate the model response.
- If JSON parsing fails or required keys are missing, retry once with a correction prompt that says: "Return JSON only exactly matching the schema."
- If it fails again, use the fallback scoring formula below and return:
  - probability: fallback result (0-100)
  - reason: "Fallback scoring used due to invalid AI output."

**Fallback scoring formula (locked):**

- Start at 10
- +30 if `hiring_spike_7d` is true
- +25 if `eng_hiring_14d` is true
- +20 if `churn_14d` is true
- +10 if `early_career_language` is true
- Clamp final probability to 0–100

Keep this spec-only and implementation-agnostic.

---

## 8. Data Model (Hackathon MVP)

### Company Record (Hard-Coded)

- `slug`
- `name`
- **signals:**
  - `hiring_spike_7d`
  - `eng_hiring_14d`
  - `churn_14d`
  - `early_career_language`
- `ai_probability`
- `ai_reason`

**No database. No migrations. Local data file only.**

---

## 9. UI Requirements

### Companies Feed (Single Page)

Must support:

- Search by company name
- Filter by traffic light
- Sort by probability (descending by default)

Each row/card shows:

- Company name
- Probability (%)
- Traffic light
- Neutral traffic-light explanation
- AI-generated reason text

### Design Constraints

- Clean
- Minimal
- Mobile-readable
- No dashboards, charts, or extra pages required

---

## 10. Explicit Non-Goals (Out of Scope)

The following are **intentionally excluded** from the hackathon MVP:

- Authentication or accounts
- Alerts or notifications
- Job listings
- Real ATS ingestion
- Backtesting or accuracy metrics
- Automation pipelines
- Scraping
- Databases

This is concept validation, not production infrastructure.

---

## 11. Hackathon Compliance Checklist

This MVP:

- [ ] Is a new, working application
- [ ] Uses DigitalOcean Gradient AI meaningfully
- [ ] Has a clear, demo-able AI feature
- [ ] Can be shown in a 2–3 minute video
- [ ] Has a public repository
- [ ] Clearly explains how AI contributes to the core value

---

## 12. Post-Hackathon Path (Not Part of MVP)

After the hackathon:

- Replace mocked signals with real ATS data (e.g., Greenhouse)
- Add historical backtesting
- Add alerts and watchlists
- Expand company coverage
- Improve model calibration

None of that blocks the MVP.

---

## 13. One-Sentence Pitch (For Devpost)

> **"Precruit uses AI to predict when companies are likely to open internship hiring windows, helping students get ahead of job postings instead of reacting too late."**
