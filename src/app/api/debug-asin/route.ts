import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get search param
    const searchParams = request.nextUrl.searchParams
    const searchAsin = searchParams.get('asin') || 'B076'
    
    // Search for books with ASINs containing the search term
    const { data: books, error } = await supabase
      .from('books')
      .select('id, asin, title, author, created_at')
      .like('asin', `%${searchAsin}%`)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Also get total count of books
    const { count } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      searchTerm: searchAsin,
      totalBooks: count,
      matchingBooks: books?.length || 0,
      books: books || []
    })
    
  } catch (error) {
    console.error('Error in debug-asin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 