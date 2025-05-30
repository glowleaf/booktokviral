import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get all books to see what's in the database
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching books:', error)
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
    }

    return NextResponse.json({ 
      totalBooks: books?.length || 0,
      books: books?.map(book => ({
        id: book.id,
        asin: book.asin,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        category: book.category,
        created_at: book.created_at
      })) || []
    })
    
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json({ error: 'Failed to fetch debug info' }, { status: 500 })
  }
} 