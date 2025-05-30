# BookTok Viral Setup Guide

## Quick Start

### 1. Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration from `supabase/migrations/001_initial_schema.sql`
3. Enable pg_cron extension:
   ```sql
   create extension if not exists pg_cron;
   ```
4. Deploy the Edge Function:
   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   npx supabase functions deploy fetch_book
   ```

### 3. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Set up a webhook endpoint:
   - URL: `https://your-domain.com/api/stripe`
   - Events: `checkout.session.completed`
4. Copy the webhook signing secret

### 4. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 5. Deployment to Vercel

1. Push your code to GitHub
2. Import the project to Vercel
3. Add all environment variables
4. Deploy!

### 6. Post-Deployment

1. Update Supabase Auth settings:
   - Add your Vercel domain to redirect URLs
   - Update site URL in project settings

2. Update Stripe webhook URL to your production domain

## Testing the Application

1. Visit http://localhost:3000
2. Click "Submit Book" (will redirect to sign in)
3. Enter your email for magic link authentication
4. Submit a book using an Amazon ASIN (e.g., B08XYZ1234)
5. Vote on books and check the weekly leaderboard

## Troubleshooting

- **Build errors**: Make sure all environment variables are set
- **Auth issues**: Check Supabase redirect URLs
- **Stripe errors**: Verify webhook secret and API keys
- **Database errors**: Ensure all migrations have been run 