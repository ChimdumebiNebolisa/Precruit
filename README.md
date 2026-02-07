# Precruit

AI-powered internship hiring window signals.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MODEL_ACCESS_KEY` in `.env` (used for DigitalOcean Serverless Inference).

## Run

```bash
npm install
npm run dev
```

The app runs without a database.

**Acceptance tests:** See [docs/acceptance-tests.md](docs/acceptance-tests.md). Run with `npm run accept:m0.3`, `npm run accept:m1.1`, or `npm run accept`.
