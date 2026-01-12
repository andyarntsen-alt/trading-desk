# Deployment Guide

This guide walks you through deploying Trading Desk to Vercel with all necessary environment variables.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Supabase](https://supabase.com) project
3. A [Clerk](https://clerk.com) application

## Environment Variables

Before deploying, you'll need to gather these environment variables:

### Supabase

Get these from your Supabase Dashboard → Project Settings → API:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your project's URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key (safe for client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, keep secret!) |

### Clerk

Get these from your Clerk Dashboard → API Keys:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key (pk_test_...) |
| `CLERK_SECRET_KEY` | Secret key (sk_test_...) |
| `CLERK_WEBHOOK_SECRET` | Webhook signing secret (set up below) |

### Optional Clerk URLs

These are pre-configured in the app but can be customized:

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | /sign-in |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | /sign-up |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | /dashboard |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | /dashboard |

## Deployment Steps

### Option 1: Using Vercel CLI (Recommended)

1. **Login to Vercel**
   ```bash
   npx vercel login
   ```

2. **Deploy to preview**
   ```bash
   npm run deploy
   ```
   
   Follow the prompts to:
   - Link to existing project or create new
   - Configure project settings (defaults work for Next.js)

3. **Set Environment Variables**
   ```bash
   npx vercel env add NEXT_PUBLIC_SUPABASE_URL
   npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY
   npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   npx vercel env add CLERK_SECRET_KEY
   npx vercel env add CLERK_WEBHOOK_SECRET
   ```
   
   Or add them all at once in the Vercel Dashboard.

4. **Deploy to Production**
   ```bash
   npm run deploy:prod
   ```

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure environment variables in the dashboard
4. Deploy

## Post-Deployment Setup

### 1. Set up Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Create a new webhook endpoint:
   - **URL**: `https://your-app.vercel.app/api/webhooks/clerk`
   - **Events**: Select `user.created`, `user.updated`, `user.deleted`
3. Copy the **Signing Secret** and add it to Vercel as `CLERK_WEBHOOK_SECRET`
4. Redeploy the app

### 2. Configure Supabase Auth (if using RLS)

Make sure your Supabase RLS policies are configured to work with Clerk JWTs. The app uses the Clerk user ID as `clerk_id` in the users table.

### 3. Run Database Migrations

Execute the SQL in `supabase/schema.sql` in your Supabase SQL Editor to create all necessary tables.

## Vercel Configuration

The `vercel.json` file includes:

- **Security headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **API caching**: Disabled for dynamic API routes
- **Region**: iad1 (US East) - modify for other regions

## Troubleshooting

### Build Fails

1. Check that all environment variables are set
2. Run `npm run build` locally to check for errors
3. Check the Vercel build logs

### Auth Not Working

1. Verify Clerk environment variables are set correctly
2. Check that the Clerk webhook is set up and the secret matches
3. Verify the webhook URL is accessible

### Database Errors

1. Check Supabase environment variables
2. Verify the database schema has been created
3. Check Supabase logs for RLS policy issues

## Useful Commands

```bash
# Check deployment status
npx vercel ls

# View logs
npx vercel logs

# Pull environment variables locally
npx vercel env pull .env.local

# Promote preview to production
npx vercel promote [deployment-url]
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
