import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // Return a mock client during build time or when env vars are missing
    console.warn('Supabase environment variables not found, using mock client')
    return null as any
  }
  
  return createBrowserClient(url, key)
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          tiktok_handle: string | null
        }
        Insert: {
          id: string
          tiktok_handle?: string | null
        }
        Update: {
          id?: string
          tiktok_handle?: string | null
        }
      }
      books: {
        Row: {
          id: string
          asin: string
          title: string | null
          author: string | null
          cover_url: string | null
          tiktok_url: string | null
          created_by: string | null
          featured_until: string | null
          created_at: string
        }
        Insert: {
          id?: string
          asin: string
          title?: string | null
          author?: string | null
          cover_url?: string | null
          tiktok_url?: string | null
          created_by?: string | null
          featured_until?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          asin?: string
          title?: string | null
          author?: string | null
          cover_url?: string | null
          tiktok_url?: string | null
          created_by?: string | null
          featured_until?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          book_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: 'active' | 'canceled' | 'past_due' | 'incomplete'
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: 'active' | 'canceled' | 'past_due' | 'incomplete'
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          book_id: string
          voter_id: string
          user_id: string | null
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          book_id: string
          voter_id: string
          user_id?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          book_id?: string
          voter_id?: string
          user_id?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
      }
      weekly_winners: {
        Row: {
          id: string
          book_id: string
          week_start: string
          week_end: string
          final_vote_count: number
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          week_start: string
          week_end: string
          final_vote_count: number
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          week_start?: string
          week_end?: string
          final_vote_count?: number
          position?: number
          created_at?: string
        }
      }
    }
  }
} 