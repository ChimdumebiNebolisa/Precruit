# Precruit MVP

A startup internship hiring-signal tracker. Target roles: SWE, SRE, infra/platform, PM intern.

## Project spec

The canonical MVP specification is **[docs/spec/Precruit.md](./docs/spec/Precruit.md)**. It defines scope, tracks, scoring, seed list, and delivery plan. Seed list: `data/companies_seed.csv` (columns and ingestion defined in spec).

## Milestones

Execution-ready MVP milestones (M1–M3), acceptance tests, guardrails, and repo mapping are in **[docs/milestones/MVP_Milestones.md](./docs/milestones/MVP_Milestones.md)**.

## Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Database**: Supabase PostgreSQL with migrations
- **Authentication**: Supabase Auth
- **Minimal Scope**: No unnecessary services or dependencies

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI (for database migrations)
- A Supabase project

### Quick Start

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd Precruit
   ```

2. Install dependencies:
   ```bash
   cd apps/web
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env.local in apps/web/
   cp .env.example apps/web/.env.local

   # Edit with your Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:
   ```bash
   cd apps/web
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000

## Project Structure

```
Precruit/
├── apps/
│   └── web/                 # Next.js frontend application
│       ├── app/             # Next.js app directory
│       ├── components/      # React components
│       └── services/        # API and Supabase services
├── packages/
│   ├── core/                # Scoring logic and shared types (future)
│   └── ingest/              # ATS adapters for signal sources (future)
├── supabase/                # Supabase configuration
│   ├── migrations/          # Database migrations
│   └── seed.sql             # Database seed data
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── .cursor/                 # Cursor AI configuration
│   └── rules/               # Cursor rules for AI assistance
├── AGENTS.md                # AI agent instructions
├── AuthSetup.md             # Authentication setup guide
└── README.md                # This file
```

## Development

### Running the App

```bash
cd apps/web
npm run dev
```

### Building for Production

```bash
cd apps/web
npm run build
npm start
```

### Linting

```bash
cd apps/web
npm run lint
```

## Database Migrations

### Create a Migration

```bash
supabase migration new descriptive_name
```

This creates a new migration file in `supabase/migrations/`. Edit the file with your SQL changes.

### Apply Migrations

```bash
supabase db push
```

### Check Migration Status

```bash
supabase migration list
```

For more details, see the [Database Migrations Guide](./supabase/README.md).

## Authentication Setup

For detailed instructions on setting up Supabase authentication, see the [Authentication Setup Guide](./AuthSetup.md).

## AI Development Support

This project includes Cursor rules for AI-assisted development:

- **Automatic Application**: Rules apply automatically based on the files you're editing
- **Template Usage**: Reference templates with `@react-component-template`
- **Best Practices**: Built-in patterns for Next.js and Supabase

For simpler AI assistance, see [AGENTS.md](./AGENTS.md) for consolidated instructions.

## Folder Responsibilities

### `apps/web/`
Next.js frontend application. Contains all UI components, pages, and client-side logic.

### `packages/core/` (Future)
Scoring logic and shared TypeScript types. Will contain the signal scoring algorithms and type definitions.

### `packages/ingest/` (Future)
ATS adapters for different signal sources. Each adapter will fetch and normalize job postings from different ATS platforms (Greenhouse, Lever, etc.).

### `supabase/`
Database migrations and seed data. All schema changes should be made through migrations.

### `docs/`
Project documentation, architecture decisions, and guides.

### `scripts/`
Utility scripts for development, deployment, or data processing.

## How to Add a New Signal Source

1. **Create adapter in `packages/ingest/`**:
   - Create a new file for the ATS adapter (e.g., `greenhouse.ts`)
   - Implement functions to fetch and normalize job postings
   - Extract relevant signals (role type, requirements, etc.)

2. **Update types in `packages/core/`**:
   - Define TypeScript types for the signal data
   - Ensure types match the scoring system requirements

3. **Add to scoring system**:
   - Update scoring logic in `packages/core/` to handle new signal types

4. **Update database schema** (if needed):
   - Create migration: `supabase migration new add_signal_source`
   - Add tables/columns to store new signal data
   - Apply migration: `supabase db push`

5. **Update frontend** (if needed):
   - Add UI components to display new signal types
   - Update dashboard to show new signals

See [AGENTS.md](./AGENTS.md) for more detailed instructions.

## License

MIT
