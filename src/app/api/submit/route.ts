import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const asin = formData.get('asin') as string
    const category = formData.get('category') as string
    const tiktok_url = formData.get('tiktok_url') as string | null

    if (!asin) {
      return new NextResponse('ASIN is required', { status: 400 })
    }

    if (!category) {
      return new NextResponse('Category is required', { status: 400 })
    }

    // Validate ASIN format
    const asinRegex = /^[A-Z0-9]{10}$/
    if (!asinRegex.test(asin)) {
      return new NextResponse('Invalid ASIN format', { status: 400 })
    }

    // Ensure user exists in users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({ id: user.id }, { onConflict: 'id' })

    if (userError) {
      console.error('Error creating user:', userError)
      return new NextResponse('Error creating user', { status: 500 })
    }

    // Fetch book details from Amazon
    let title = `Book ${asin}`
    let author = 'Unknown Author'
    let cover_url = null

    try {
      console.log('Fetching book details for ASIN:', asin)
      const detailsResponse = await fetch(`${request.nextUrl.origin}/api/fetch-book-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin })
      })
      
      if (detailsResponse.ok) {
        const details = await detailsResponse.json()
        title = details.title || title
        author = details.author || author
        cover_url = details.cover_url || cover_url
        console.log('Successfully fetched book details:', { title, author, cover_url })
      } else {
        console.log('Failed to fetch book details, using defaults')
      }
    } catch (error) {
      console.error('Error fetching book details:', error)
      console.log('Using default book details')
    }

    // Prepare book data
    const bookData = {
      asin,
      title,
      author,
      cover_url,
      category,
      tiktok_url: tiktok_url || null,
      created_by: user.id,
    }

    console.log('Inserting book with data:', bookData)

    // Insert book with fetched details
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert(bookData)
      .select()
      .single()

    if (bookError) {
      if (bookError.code === '23505') {
        // Unique constraint violation - book already exists
        return new NextResponse('This book has already been submitted', { status: 409 })
      }
      console.error('Error inserting book:', bookError)
      return new NextResponse('Error submitting book', { status: 500 })
    }

    console.log('Book submitted successfully:', asin, 'Category:', category)

    // Return success with book ID
    return NextResponse.json({ success: true, bookId: book.id })
    
  } catch (error) {
    console.error('Error in submit API:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 