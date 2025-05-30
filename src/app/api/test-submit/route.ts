import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Test ASIN
    const asin = 'B076YGKSBZ'
    
    // Check if it already exists
    const { data: existing } = await supabase
      .from('books')
      .select('*')
      .eq('asin', asin)
      .single()
    
    if (existing) {
      return NextResponse.json({
        message: 'Book already exists',
        book: existing
      })
    }
    
    // Fetch book details
    const detailsResponse = await fetch(`${request.nextUrl.origin}/api/fetch-book-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin })
    })
    
    const details = await detailsResponse.json()
    
    // Insert book
    const { data: book, error } = await supabase
      .from('books')
      .insert({
        asin,
        title: details.title || `Book ${asin}`,
        author: details.author || 'Unknown Author',
        cover_url: details.cover_url,
        category: 'Fiction',
        created_by: '00000000-0000-0000-0000-000000000000' // Dummy user ID
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'Book submitted successfully',
      book,
      details
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 