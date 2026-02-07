# Precruit Cursor Guardrails

## Mission
Implement the Precruit MVP exactly as defined in `precruit_spec.md`. If a request conflicts with the spec, the spec wins.

## Non-negotiables
- No scope creep. Do not add login, accounts, saved lists, job scraping, funding sources, extra pages, DB, analytics, or "nice to have" features.
- Single-page app only. The UI is one page with search, filter by traffic light, and sort by probability.
- Signals are mocked booleans stored in a local data file. No DB.
- AI is DigitalOcean Serverless Inference (OpenAI-compatible `/v1/chat/completions`) with `MODEL_ACCESS_KEY`.
- AI output must be strict JSON: `{ "probability": int 0-100, "reason": "one sentence" }`.
- Validate strictly. Retry once with a correction prompt. If still invalid, use fallback formula only.
- Cache AI per company per server process. Cache key is company slug plus stable hash of signals.
- UI must not trigger recompute when searching, filtering, sorting.

## Work style
- Implement the smallest possible change that completes the current sub-milestone.
- Touch only the files listed in the current sub-milestone's "Files to change". If you must touch another file, explain why, then proceed with the minimal change.
- Keep changes readable and boring. No clever refactors.
- No large commits. One sub-milestone equals one commit.

## Execution loop for every sub-milestone
1) Restate the sub-milestone goal in one sentence.
2) List the exact files you will modify.
3) Make the changes.
4) Show `git diff`.
5) Run the required check:
   - If backend change: run the server and hit the key endpoint.
   - If frontend change: run dev server and verify the specific UI behavior.
6) Commit with the required message format.
7) Push.

## Git rules
- Branch naming: `m0-*`, `m1-*`, `m2-*`, `m3-*` (one branch per milestone).
- Commit message format: `M<milestone>.<sub>: <specific change>`.
- Commands must be provided explicitly after each sub-milestone:
  - `git status`
  - `git add <exact file list>`
  - `git commit -m "M<milestone>.<sub>: ..."`
  - `git push` (use `-u origin <branch>` the first time)

## Quality bar
- Add or update TypeScript types for any API payloads. Do not allow frontend and backend to drift.
- Avoid silent failures. If AI fails validation, log it and fallback.
- Use clear, explicit naming. No magic numbers outside the documented scoring formula.

## AI integration rules
- Use base URL: `https://inference.do-ai.run/v1/`.
- Use `MODEL_ACCESS_KEY` from environment.
- Include a deterministic prompt that demands JSON only.
- Enforce integer probability 0–100. Non-integer is invalid.
- Retry exactly once on invalid JSON, then fallback formula.
- Add explicit cache logs:
  - `AI_CACHE_MISS <slug>`
  - `AI_CACHE_HIT <slug>`

## Acceptance test rules
For each sub-milestone, include a concrete manual test that can be repeated.
For caching, the acceptance test must prove:
- Two calls to `/api/companies` results in HITs on the second call.
- Changing a signal and restarting server produces a MISS for that company.

## If blocked
Do not continue blindly.
Return a short blocker report:
- What you tried
- Exact error text
- File path and line number if relevant
- The smallest next step to resolve it
Then stop.

## Output format in responses
- Use checklists for exit criteria and acceptance tests.
- Keep explanations short. Prefer actions over commentary.
