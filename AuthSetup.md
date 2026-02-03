# Supabase Authentication Setup Guide

This guide provides instructions for configuring Supabase authentication for Precruit.

## Prerequisites

1. Create a [Supabase](https://supabase.com) account and project
2. Set up your application's environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Create a `.env.local` file in `apps/web/` with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Email/Password Authentication

Email/password authentication is enabled by default in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Email" in the list of providers
4. Configure your preferred settings:
   - Enable/disable "Confirm email"
   - Set up email templates
   - Configure security options
5. Save your changes

## OAuth Providers (Optional)

To enable OAuth providers like Google, GitHub, or LinkedIn:

1. Register your application with the provider
2. Configure the callback URL in the provider's settings:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   ```
3. In Supabase dashboard, go to "Authentication" > "Providers"
4. Enable and configure the provider with your Client ID and Client Secret

For detailed provider-specific instructions, see the [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth).

## Using Authentication in the App

The app uses Supabase client-side authentication. See `apps/web/services/supabase.ts` for authentication functions.

For more advanced configuration, refer to the [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth).
