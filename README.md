# BookTok Viral

<!-- Deployment trigger -->

A modern web application for discovering and voting on viral books from BookTok, built with Next.js 14, Supabase, and Stripe.

## Features

- 📚 Submit books using Amazon ASIN
- ❤️ Vote for your favorite books
- 🏆 Weekly leaderboard with vote reset
- ⭐ Feature books for increased visibility ($9.99)
- 🔐 Magic link authentication
- 📱 Responsive design with Tailwind CSS
- 🚀 Automatic Amazon book data fetching

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Payments**: Stripe Checkout
- **Deployment**: Vercel (frontend), Supabase (backend)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Vercel account (for deployment)

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
3. Enable the `pg_cron` extension in the SQL editor:
   ```sql
   create extension if not exists pg_cron;
   ```
4. Deploy the Edge Function:
   ```bash
   npx supabase functions deploy fetch_book
   ```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

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

### 4. Stripe Setup

1. Create a Stripe account
2. Set up a webhook endpoint pointing to `/api/stripe`
3. Configure the webhook to listen for `checkout.session.completed` events
4. Copy the webhook secret to your environment variables

### 5. Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Deployment

#### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add all environment variables in the Vercel dashboard
3. Deploy the application

#### Supabase Configuration

1. In your Supabase project, go to Authentication → URL Configuration
2. Add your Vercel domain to the allowed redirect URLs
3. Update the site URL in your project settings

## Database Schema

### Tables

- **users**: User profiles linked to Supabase Auth
- **books**: Book submissions with Amazon ASIN, title, author, cover
- **votes**: User votes for books (unique constraint per user/book)

### Key Features

- Row Level Security (RLS) enabled on all tables
- Automatic book data fetching via Edge Functions
- Weekly vote reset using pg_cron
- Featured books system with Stripe integration

## API Routes

- `POST /api/submit` - Submit a new book
- `POST /api/create-checkout-session` - Create Stripe checkout for featuring
- `POST /api/stripe` - Stripe webhook handler
- `GET /auth/callback` - Authentication callback

## Edge Functions

- `fetch_book` - Fetches book details from Amazon and updates the database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@booktokviral.com or create an issue on GitHub.
