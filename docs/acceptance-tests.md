# Acceptance tests

Repeatable acceptance checks for completed sub-milestones. No test framework; run via npm scripts or `ts-node` from project root.

---

## M0.3 — Data loader

**What:** Load companies from the data file; print count and first company's signals.

**Run:** `npm run accept:m0.3` (or `npx ts-node scripts/accept-m0.3-loader.ts` from project root).

**Expect:** Company count and first company printed; exit code 0.

**Failure:** Missing or invalid `data/companies.json`, or invalid JSON → script throws, non-zero exit.

---

## M1.1 — Traffic light

**What:** Assert 60→Green, 40→Yellow, 20→Orange, 19→Red and that the Green message contains "next 30 days".

**Run:** `npm run accept:m1.1` (or `npx ts-node scripts/accept-m1.1-traffic-light.ts` from project root).

**Expect:** "M1.1 acceptance: passed" and exit code 0.

**Failure:** Wrong light for a boundary value or Green message missing "next 30 days" → message to stderr, exit code 1.

---

## Run all

`npm run accept` runs M0.3 then M1.1.
