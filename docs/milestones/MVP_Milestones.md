# Precruit MVP — Execution-ready Milestones

This document defines the MVP milestones and sub-milestones for Precruit, aligned with the [Precruit spec](../../precruit_spec.md). Each milestone is independently demo-able. Execute sub-milestones in order; after each Mx.y run the Git commands at the end of that section.

**Branch order:** `m0-foundation` → merge to `main` → `m1-api` → merge to `main` → `m2-ai` → merge to `main` → `m3-ui` → merge to `main`.

---

## M0 — Foundation & Data

**Demo:** Run app (or script) and load companies from a local data file with mocked signals.

### M0.1 — Project scaffold and env

- **Goal:** Repo can be installed and run with a placeholder script; MODEL_ACCESS_KEY is documented via .env.example.
- **Files to change:** `package.json`, `.env.example`, `README.md` (minimal), `tsconfig.json` (if using TypeScript).
- **Implementation notes:**
  - Add dependencies: express (or fastify), dotenv, openai (or fetch-only), plus dev deps (typescript, ts-node, etc.).
  - `.env.example`: single line `MODEL_ACCESS_KEY=` with short comment.
  - README: project name, one-line description, how to copy `.env.example` to `.env` and set MODEL_ACCESS_KEY.
  - No database or extra services.
- **Exit criteria:**
  - [ ] `npm install` succeeds.
  - [ ] Running the app or a stub script does not require a DB.
  - [ ] `.env.example` exists and documents MODEL_ACCESS_KEY.
- **Acceptance test:** Clone repo, copy `.env.example` to `.env`, run `npm install` and `npm run dev` (or equivalent); app starts without DB errors.
- **No scope creep:** No auth, no job listings, no real ATS.

**Git commands (M0.1):**
```bash
git checkout -b m0-foundation
git status
git add package.json .env.example README.md tsconfig.json
git commit -m "M0.1: Project scaffold and MODEL_ACCESS_KEY env"
git push -u origin m0-foundation
```

---

### M0.2 — Company data file with mocked signals

- **Goal:** A single local data file defines companies with slug, name, and the four boolean signals from the spec.
- **Files to change:** `data/companies.json` (or `src/data/companies.json`).
- **Implementation notes:**
  - Each company: `slug`, `name`, `hiring_spike_7d`, `eng_hiring_14d`, `churn_14d`, `early_career_language` (all booleans).
  - At least 5–10 sample companies with varied signal combinations so traffic lights and fallback formula can be demonstrated.
  - No DB; file is the source of truth.
- **Exit criteria:**
  - [ ] File exists and is valid JSON.
  - [ ] Every company has slug, name, and the four signal keys.
  - [ ] No extra keys required for MVP (e.g. no ai_probability in file; that is computed).
- **Acceptance test:** Open the file; confirm structure and at least one company with mixed true/false signals.
- **No scope creep:** No API, no AI, no UI; data only.

**Git commands (M0.2):**
```bash
git status
git add data/companies.json
git commit -m "M0.2: Company data file with mocked signals"
git push
```

---

### M0.3 — Data loader and Company types

- **Goal:** Application loads companies from the data file and exposes them via typed `CompanyInput`; API response shape is defined as `CompanyApiItem`.
- **Files to change:** `src/types.ts`, `src/load-companies.ts` (or equivalent paths).
- **Implementation notes:**
  - In `src/types.ts`, define **CompanyInput** (from JSON file): slug, name, and the four boolean signals (hiring_spike_7d, eng_hiring_14d, churn_14d, early_career_language). Define **CompanyApiItem** (API response): slug, name, probability, traffic_light, neutral_explanation, ai_reason.
  - Loader reads the JSON file and returns an array of CompanyInput. Handle missing file or invalid JSON with a clear error.
  - No caching of file read required for MVP; can re-read on each request or once at startup.
- **Exit criteria:**
  - [ ] CompanyInput and CompanyApiItem are defined in src/types.ts; CompanyInput matches spec (slug, name, signals).
  - [ ] Loader returns typed array of CompanyInput; no AI inference yet.
  - [ ] Running a small script that calls the loader and logs companies succeeds.
- **Acceptance test:** Run a script that imports the loader and prints company count and one company's signals.
- **No scope creep:** No API routes, no AI, no UI.

**Git commands (M0.3):**
```bash
git status
git add src/types.ts src/load-companies.ts
git commit -m "M0.3: Data loader and CompanyInput/CompanyApiItem types"
git push
```

---

## M1 — API + Fallback + Traffic Light (no AI)

**Demo:** GET /api/companies returns companies with probability (from fallback formula), traffic light, neutral explanation, and fixed reason text; no AI calls yet.

### M1.1 — Traffic light derivation and messages

- **Goal:** Given probability 0–100, compute traffic light (Green / Yellow / Orange / Red) and the exact spec message for each.
- **Files to change:** `src/lib/traffic-light.ts`.
- **Implementation notes:**
  - Green: probability >= 60 — "This company shows strong hiring activity and may enter an internship window in the next 30 days."
  - Yellow: 40–59 — "This company shows moderate hiring activity. An internship window is possible."
  - Orange: 20–39 — "This company shows limited recent hiring activity."
  - Red: < 20 — "No significant hiring activity detected."
  - Function signature: e.g. `getTrafficLight(probability: number): { light: string, message: string }`.
- **Exit criteria:**
  - [ ] Thresholds and messages match spec exactly.
  - [ ] Green message includes "next 30 days" (spec requirement).
- **Acceptance test:** Unit test or manual: 60 -> Green, 40 -> Yellow, 20 -> Orange, 19 -> Red; messages match.
- **No scope creep:** No API route yet; pure function only.

**Git commands (M1.1):**
```bash
git checkout main
git merge m0-foundation
git checkout -b m1-api
git status
git add src/lib/traffic-light.ts
git commit -m "M1.1: Traffic light derivation and spec messages"
git push -u origin m1-api
```

---

### M1.2 — Fallback formula

- **Goal:** Implement the locked fallback formula: start 10; +30 hiring_spike_7d, +25 eng_hiring_14d, +20 churn_14d, +10 early_career_language; clamp 0–100.
- **Files to change:** `src/lib/fallback-formula.ts`.
- **Implementation notes:**
  - Input: company signals (four booleans). Output: number 0–100.
  - No AI, no retry; formula only. Used by M1.3 for all companies until M2 wires in AI.
- **Exit criteria:**
  - [ ] Formula implemented exactly as spec; result clamped 0–100.
  - [ ] Known signal inputs produce expected probability (e.g. all true -> 95).
- **Acceptance test:** Call with known signals; verify output matches spec formula.
- **No scope creep:** No inference, no cache; formula only.

**Git commands (M1.2):**
```bash
git status
git add src/lib/fallback-formula.ts
git commit -m "M1.2: Fallback formula (locked spec)"
git push
```

---

### M1.3 — API endpoint: companies with fallback-only probability and traffic light

- **Goal:** One endpoint in `src/server.ts` returns all companies with: name, slug, probability (from fallback formula), traffic_light, neutral explanation (message), ai_reason (use "Fallback scoring used due to invalid AI output." for all in M1). Response shape must match CompanyApiItem.
- **Files to change:** `src/server.ts`, `src/load-companies.ts` (used by server).
- **Implementation notes:**
  - In `src/server.ts`, add GET /api/companies: load companies (CompanyInput[]) from data file; for each company, compute probability via fallback formula, apply traffic light from M1.1, set reason to "Fallback scoring used due to invalid AI output." Build and return array of CompanyApiItem.
  - No pagination; return full list. No AI or cache in M1.
- **Exit criteria:**
  - [ ] Endpoint returns 200 and array of companies with required fields (CompanyApiItem shape).
  - [ ] probability and traffic_light and messages are consistent with formula and spec.
  - [ ] ai_reason is the fixed fallback string for every company.
- **Acceptance test:** GET /api/companies; assert JSON array, each item has probability 0–100, traffic_light one of Green/Yellow/Orange/Red, and both explanation and ai_reason strings.
- **No scope creep:** No search/filter/sort in API; those are UI-only.

**Git commands (M1.3):**
```bash
git status
git add src/server.ts src/load-companies.ts
git commit -m "M1.3: API endpoint companies with fallback probability and traffic light"
git push
```

---

### M1.4 — Serve placeholder static page and CORS (if needed)

- **Goal:** Server serves a placeholder static page from `public/` and allows frontend to call the API (CORS if frontend on different origin or port). No built client artifacts; server-side and placeholder only.
- **Files to change:** `src/server.ts`, `package.json`, `public/index.html`.
- **Implementation notes:**
  - Create `public/index.html` (minimal placeholder, e.g. "Precruit" and a link or note that the app will load here). Mount static middleware in `src/server.ts` for `public/` so visiting "/" serves `public/index.html`.
  - If frontend is on different port (e.g. Vite dev), enable CORS for that origin so GET /api/companies works.
  - Single page only; no other routes required for MVP. Do not reference or add client/dist or built artifacts in M1.4.
- **Exit criteria:**
  - [ ] Opening "/" in browser loads the placeholder page from public/index.html.
  - [ ] Frontend can call /api/companies and receive JSON.
- **Acceptance test:** Start server, open root URL, confirm placeholder page loads; from browser devtools, confirm API request returns companies.
- **No scope creep:** No auth, no extra pages.

**Git commands (M1.4):**
```bash
git status
git add src/server.ts package.json public/index.html
git commit -m "M1.4: Serve placeholder static page and CORS for API"
git push
```

---

## M2 — AI (DO inference + strict JSON + retry + cache)

**Demo:** API uses DigitalOcean Serverless Inference per company; strict JSON validation; retry once on invalid output then fallback; in-memory cache by slug + hash(signals).

### M2.1 — DigitalOcean Serverless Inference client and model config

- **Goal:** App can call GET /v1/models and POST /v1/chat/completions with base_url https://inference.do-ai.run/v1/ and Bearer MODEL_ACCESS_KEY; MODEL_ID is pinned in config.
- **Files to change:** `src/lib/do-client.ts` (or `src/lib/ai-client.ts`), `src/config.ts` or `config/model.ts`, `.env.example` (already has MODEL_ACCESS_KEY).
- **Implementation notes:**
  - Use OpenAI SDK with `baseURL: "https://inference.do-ai.run/v1/"` and `apiKey: process.env.MODEL_ACCESS_KEY`.
  - One-time: call GET /v1/models, pick a model, set MODEL_ID in config. Document in README that MODEL_ID is pinned for MVP.
  - No inference yet; only client setup and optional GET /v1/models script or startup check.
- **Exit criteria:**
  - [ ] Client uses correct base_url and Authorization header.
  - [ ] MODEL_ACCESS_KEY read from env; app fails fast if missing.
  - [ ] MODEL_ID is set in config (from GET /v1/models response) and used for chat completions.
- **Acceptance test:** Run a minimal script that lists models or sends one test completion; confirm no 401 and valid response.
- **No scope creep:** No caching, no retry/fallback, no multi-company loop.

**Git commands (M2.1):**
```bash
git checkout main
git merge m1-api
git checkout -b m2-ai
git status
git add src/lib/do-client.ts src/config.ts
git commit -m "M2.1: DO Serverless Inference client and model config"
git push -u origin m2-ai
```

---

### M2.2 — Prompt builder, completion call, and strict JSON validation

- **Goal:** For one company, build the spec prompt (company name + signals), call /v1/chat/completions, parse response as JSON, and validate schema { probability: integer 0–100, reason: string }. Non-integer probability is invalid and triggers retry then fallback in M2.3.
- **Files to change:** `src/lib/prompt.ts`, `src/lib/do-client.ts` (or `ai-client.ts`), `src/lib/validate-response.ts` (or `parse-ai-response.ts`).
- **Implementation notes:**
  - Prompt: company name, list of signals (e.g. "hiring_spike_7d: true"), task sentence (predict probability 0–100 for internship window in 30 days), and instruction that emphasizes integer: "Output must be JSON only, no markdown. Exactly: { \"probability\": <integer 0-100, whole number only>, \"reason\": \"<one sentence>\" }. probability must be an integer."
  - Parse response: extract content, parse as JSON, check presence of `probability` and `reason`. Validate that probability is an integer in [0, 100] (if typeof number but not integer, or out of range, treat as invalid).
  - Return typed result or throw/return error for invalid output (invalid JSON, missing keys, non-integer or out-of-range probability).
- **Exit criteria:**
  - [ ] Prompt matches spec and explicitly requires integer probability.
  - [ ] Response is parsed and validated; invalid JSON, missing/wrong keys, or non-integer probability are detected and trigger invalid path.
  - [ ] Valid output returns { probability, reason } with integer probability in [0, 100].
- **Acceptance test:** Call inference for one company; assert response has integer probability in range and non-empty reason; test with invalid mock (e.g. probability 50.5 or "50") and assert validation fails.
- **No scope creep:** No retry, no fallback formula in this step, no cache yet.

**Git commands (M2.2):**
```bash
git status
git add src/lib/prompt.ts src/lib/validate-response.ts src/lib/do-client.ts
git commit -m "M2.2: Prompt builder, completion call, strict JSON validation"
git push
```

---

### M2.3 — Retry once on invalid output; fallback on second failure

- **Goal:** If validation fails, retry once with a correction prompt; if still invalid, use the locked fallback formula and return reason "Fallback scoring used due to invalid AI output."
- **Files to change:** `src/lib/ai-orchestrator.ts` (or extend `do-client.ts` / `prompt.ts`), reuse `src/lib/fallback-formula.ts`.
- **Implementation notes:**
  - On first validation failure: send one retry with correction prompt: "Return JSON only exactly matching the schema."
  - On second failure: compute fallback probability via existing fallback formula, set reason to "Fallback scoring used due to invalid AI output."
  - Return same shape { probability, reason } in all cases.
- **Exit criteria:**
  - [ ] Retry runs at most once with correction prompt.
  - [ ] Fallback formula used on second failure; result clamped 0–100.
  - [ ] Fallback reason text matches spec exactly.
- **Acceptance test:** Force invalid AI response (e.g. mock); confirm retry then fallback result; verify formula with known signal inputs.
- **No scope creep:** No caching in this step; single-company flow only.

**Git commands (M2.3):**
```bash
git status
git add src/lib/ai-orchestrator.ts
git commit -m "M2.3: Retry once on invalid output; fallback on second failure"
git push
```

---

### M2.4 — In-memory cache and wire API to AI path

- **Goal:** Inference is computed once per company per server process; cache key is company slug + stable hash of the four signal booleans. API in `src/server.ts` uses AI path (with cache) instead of fallback-only; UI interactions (filter/search/sort) do not trigger new inference. Response shape remains CompanyApiItem.
- **Files to change:** `src/lib/ai-cache.ts`, `src/lib/ai-orchestrator.ts` (or wherever inference is invoked), `src/server.ts`. Ensure `src/types.ts` CompanyApiItem is used for the response.
- **Implementation notes:**
  - Cache: in-memory Map. Key: e.g. `slug + "|" + hash(signals)` where hash is stable (e.g. sorted key-value string or small hash function).
  - On "get AI result for company": if cache hit, log `AI_CACHE_HIT` (e.g. with slug); return cached { probability, reason }. On cache miss, log `AI_CACHE_MISS` (e.g. with slug); call orchestrator (AI + retry + fallback), store in cache, return.
  - In `src/server.ts`: for each CompanyInput, get result from cache (HIT or MISS per company); build CompanyApiItem (probability, traffic_light, neutral_explanation, ai_reason) and return array. No other route files; single server entry point only.
  - No TTL required for MVP; process lifetime is enough.
- **Exit criteria:**
  - [ ] Cache key includes slug and signal values (e.g. hash of signals).
  - [ ] Same company + same signals always returns same cached result in same process; cache miss triggers inference, cache hit does not.
  - [ ] API returns CompanyApiItem[]; AI-generated reason when valid; fallback reason when fallback used.
- **Acceptance test (no recompute on UI interactions):**
  - (a) Start server. Call GET /api/companies once; note logs show AI_CACHE_MISS for each company. Call GET /api/companies a second time; logs must show only AI_CACHE_HIT (no MISS). So second call does not trigger any new inference.
  - (b) Stop server. Change one company's signal in `data/companies.json` (e.g. flip one boolean). Restart server. Call GET /api/companies; logs must show AI_CACHE_MISS for that company (and HIT for others unchanged). Confirm that company's probability/reason can differ after signal change.
- **No scope creep:** No disk cache, no distributed cache, no DB.

**Git commands (M2.4):**
```bash
git status
git add src/lib/ai-cache.ts src/lib/ai-orchestrator.ts src/server.ts
git commit -m "M2.4: In-memory cache by slug + hash(signals); API uses AI path"
git push
```

---

## M3 — UI (Single Page)

**Demo:** User sees company list with search, traffic-light filter, and sort by probability (desc default); each row shows name, probability, light, neutral explanation, AI reason.

### M3.1 — Company list and card/row layout

- **Goal:** Single page fetches /api/companies and displays each company: name, probability (%), traffic light, neutral explanation, AI-generated reason.
- **Files to change:** `client/index.html`, `client/src/main.tsx` (or main.js), `client/src/App.tsx`, `client/src/components/CompanyList.tsx` (or equivalent), minimal CSS.
- **Implementation notes:**
  - Fetch on load; show loading state then list. Each row/card: company name, probability 0–100, traffic light (visual + label), spec message, ai_reason.
  - Design: clean, minimal, mobile-readable (per spec). No dashboards or charts.
- **Exit criteria:**
  - [ ] All companies from API rendered.
  - [ ] Each item shows name, probability, traffic light, neutral explanation, AI reason.
  - [ ] Green message includes "next 30 days" where applicable.
- **Acceptance test:** Load app; verify list matches API; resize to mobile and confirm readable.
- **No scope creep:** No search/filter/sort yet; list only.

**Git commands (M3.1):**
```bash
git checkout main
git merge m2-ai
git checkout -b m3-ui
git status
git add client/index.html client/src/main.tsx client/src/App.tsx client/src/components/CompanyList.tsx client/src/*.css
git commit -m "M3.1: Company list and card layout with probability, light, reason"
git push -u origin m3-ui
```

---

### M3.2 — Search by company name

- **Goal:** User can type in a search box; list filters to companies whose name matches (client-side).
- **Files to change:** `client/src/App.tsx` (or state + filter component), `client/src/components/SearchBar.tsx` (optional).
- **Implementation notes:**
  - Search is client-side over the already-fetched list. Case-insensitive substring match on company name is sufficient.
  - No API change; filter in frontend only.
- **Exit criteria:**
  - [ ] Typing filters the visible list by name.
  - [ ] Clearing search restores full list.
- **Acceptance test:** Type part of a company name; list shrinks; clear and list returns.
- **No scope creep:** Search by name only; no tags or extra filters.

**Git commands (M3.2):**
```bash
git status
git add client/src/App.tsx client/src/components/SearchBar.tsx
git commit -m "M3.2: Search by company name"
git push
```

---

### M3.3 — Filter by traffic light

- **Goal:** User can filter the list by one or more traffic lights (e.g. dropdown or chips: All, Green, Yellow, Orange, Red).
- **Files to change:** `client/src/App.tsx` (or filter state), `client/src/components/TrafficLightFilter.tsx` (optional).
- **Implementation notes:**
  - Client-side filter; combine with search and sort.
  - "All" shows every company; selecting Green shows only Green, etc.
- **Exit criteria:**
  - [ ] Filter control exists and affects visible list.
  - [ ] Combined with search still works.
- **Acceptance test:** Select Green only; only Green companies show; switch to All and list restores.
- **No scope creep:** Filter by traffic light only; no custom ranges.

**Git commands (M3.3):**
```bash
git status
git add client/src/App.tsx client/src/components/TrafficLightFilter.tsx
git commit -m "M3.3: Filter by traffic light"
git push
```

---

### M3.4 — Sort by probability (descending by default)

- **Goal:** List is sorted by probability descending by default; user can optionally switch to ascending if desired (spec says "desc default"; one toggle is enough for MVP).
- **Files to change:** `client/src/App.tsx` (sort state + applied order), optionally `client/src/components/CompanyList.tsx`.
- **Implementation notes:**
  - Default: sort by probability descending. Optional: toggle to ascending.
  - Apply sort to the list after search and filter (client-side).
- **Exit criteria:**
  - [ ] Initial load shows highest probability first.
  - [ ] If sort toggle exists, switching changes order.
- **Acceptance test:** Load page; confirm first company has highest probability; toggle sort (if implemented) and confirm order flips.
- **No scope creep:** Sort by probability only; no multi-column sort.

**Git commands (M3.4):**
```bash
git status
git add client/src/App.tsx client/src/components/CompanyList.tsx
git commit -m "M3.4: Sort by probability desc default"
git push
```

**Final merge to main:**
```bash
git checkout main
git merge m3-ui
git push origin main
```

---

## Demo Script (2–3 minutes)

Use this checklist to record or present the MVP:

1. **Open the app** — Single page loads with no login.
2. **List** — Show companies with probability, traffic light, neutral explanation, and AI reason for at least one Green and one non-Green.
3. **Search** — Type a company name; list filters; clear and show full list again.
4. **Filter** — Select "Green" only; show only Green companies; switch back to All.
5. **Sort** — Point out default sort (highest probability first); optionally toggle to ascending.
6. **AI value** — In one sentence: "AI predicts likelihood and explains why; if the model misbehaves we fall back to a fixed formula so the product still works."
7. **No scope** — Mention: no accounts, no job listings, no database; concept validation only.

---

## Compliance with Spec

- Public, no-login, single-page app listing companies.
- Each company: probability 0–100, traffic light, neutral explanation, AI-generated reason.
- Signals mocked in local data file; no DB.
- AI: DigitalOcean Serverless Inference (base_url https://inference.do-ai.run/v1/), MODEL_ACCESS_KEY from env.
- Cache: per company per process; key = slug + stable hash of signals.
- AI output: strict JSON { "probability": int 0–100, "reason": "one sentence" }; retry once then fallback formula.
- UI: search by name, filter by traffic light, sort by probability desc default; no extra pages.
- No auth, no DB, no job listings, no real ATS.
