import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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
      votes: {
        Row: {
          book_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          book_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          book_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
} 