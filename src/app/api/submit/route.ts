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
    const tiktok_url = formData.get('tiktok_url') as string | null
    const title = formData.get('title') as string | null
    const author = formData.get('author') as string | null
    const cover_url = formData.get('cover_url') as string | null

    if (!asin) {
      return new NextResponse('ASIN is required', { status: 400 })
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

    // Prepare book data
    const bookData = {
      asin,
      title: title || null,
      author: author || null,
      cover_url: cover_url || null,
      tiktok_url: tiktok_url || null,
      created_by: user.id,
    }

    console.log('Inserting book with data:', bookData)

    // Insert book with fetched details
    const { error: bookError } = await supabase
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

    console.log('Book submitted successfully:', asin)

    // Redirect to success page
    return NextResponse.redirect(new URL('/success', request.url), 303)
    
  } catch (error) {
    console.error('Error in submit API:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 