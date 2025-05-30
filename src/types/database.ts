export interface Book {
  id: string
  asin: string
  title: string | null
  author: string | null
  cover_url: string | null
  category: string | null
  tiktok_url: string | null
  created_by: string | null
  featured_until: string | null
  created_at: string
  votes?: Array<{ count: number }>
}

export interface User {
  id: string
  tiktok_handle: string | null
}

export interface Vote {
  book_id: string
  user_id: string
  created_at: string
} 