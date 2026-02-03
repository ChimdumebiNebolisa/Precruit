# Intern Insight MVP - Agent Instructions

**Read [docs/spec/Intern_Insight.md](./docs/spec/Intern_Insight.md) before making changes. Do not change scope without updating the spec.**

- Any change to scoring weights or thresholds must update `docs/spec/Intern_Insight.md` and append to `docs/spec/weights_changelog.md`.

Intern Insight is a startup internship hiring-signal tracker. Target roles: SWE, SRE, infra/platform, PM intern.

**MVP scope**: Next.js (apps/web) and Supabase only. No separate backend services or new top-level packages unless the spec is updated.

## Architecture Overview

- **Frontend**: Next.js with Tailwind CSS and TypeScript
- **Database**: Supabase PostgreSQL with migrations
- **Authentication**: Supabase Auth
- **Stack**: Next.js + TypeScript + Supabase (minimal scope, no unnecessary services)

## Development Standards

### Code Style
- Use TypeScript for all frontend files
- Follow async/await patterns consistently
- Use camelCase for TypeScript
- Include proper error handling in all functions

### Architecture Patterns
- Use Supabase client directly for database operations
- Implement proper authentication on protected routes
- Use Row Level Security (RLS) policies for data security
- Follow Next.js App Router patterns

### File Organization
- **apps/web/**: Next.js application
  - `app/`: Next.js app directory (pages, layouts, routes)
  - `components/`: React components
  - `services/`: API and Supabase service clients
- **packages/core/**: Scoring logic and shared types (future)
- **packages/ingest/**: ATS adapters for signal sources (future)
- **supabase/migrations/**: Database migrations
- **docs/**: Documentation
- **scripts/**: Utility scripts

## Common Patterns

### React Components
```tsx
'use client'
export default function ComponentName({ title, onAction }: Props) {
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    try {
      setLoading(true)
      await onAction?.()
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 rounded-lg border">
      {/* Component content */}
    </div>
  )
}
```

### Supabase Database Operations
```tsx
import { supabase } from '@/services/supabase'

// Fetch data
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value')

// Insert data
const { data, error } = await supabase
  .from('table_name')
  .insert({ column: 'value' })

// Update data
const { data, error } = await supabase
  .from('table_name')
  .update({ column: 'new_value' })
  .eq('id', id)
```

### Database Migrations
```sql
-- Create table with RLS
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own items"
  ON public.items
  USING (auth.uid() = user_id);
```

## Development Workflow

1. **Setup**: Install dependencies with `cd apps/web && npm install`
2. **Development**: Run `cd apps/web && npm run dev` to start dev server
3. **Database**: Use `supabase migration new name` for schema changes
4. **Testing**: Visit http://localhost:3000 for the application

## Key Services

- **Supabase Client**: Database operations and authentication
- **Supabase Auth**: User authentication and session management

## Environment Configuration

Required environment variables in `apps/web/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` (required)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required)

## Best Practices

- Always use the Supabase client for database operations
- Implement proper error handling with descriptive messages
- Use authentication checks on protected routes
- Follow the established patterns for consistency
- Use database migrations for all schema changes
- Implement proper RLS policies for data security

## Adding a New Signal Source (post-MVP)

When expanding beyond MVP (e.g. adding packages/ingest, packages/core), to add a new signal source (ATS adapter):

1. **Create adapter in `packages/ingest/`**:
   - Create a new file for the ATS adapter (e.g., `greenhouse.ts`, `lever.ts`)
   - Implement the adapter interface to fetch and normalize job postings
   - Extract relevant signals (role type, requirements, etc.)

2. **Update types in `packages/core/`**:
   - Define TypeScript types for the signal data
   - Ensure types match the scoring system requirements

3. **Add to scoring system**:
   - Update scoring logic in `packages/core/` to handle new signal types
   - Ensure signals are properly weighted and aggregated

4. **Update database schema** (if needed):
   - Create migration: `supabase migration new add_signal_source`
   - Add tables/columns to store new signal data
   - Apply migration: `supabase db push`

5. **Update frontend** (if needed):
   - Add UI components to display new signal types
   - Update dashboard to show new signals

When adding new features, follow the established patterns and maintain consistency with the existing codebase structure.
