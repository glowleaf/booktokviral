import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { getBookDetails } from '@/lib/amazon-api'

// Force deployment update with new credentials - 2025-01-30
export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }

    console.log('Fetching book details for ASIN:', asin)

    // Try Amazon Product Advertising API first
    const amazonDetails = await getBookDetails(asin)
    
    if (amazonDetails) {
      console.log('Successfully fetched book details from Amazon PA-API:', amazonDetails)
      return NextResponse.json(amazonDetails)
    }

    // Fallback: Generate basic info
    console.log('Amazon PA-API failed, using fallback for ASIN:', asin)
    return NextResponse.json({
      title: `Book ${asin}`,
      author: 'Unknown Author',
      cover_url: null
    })

  } catch (error) {
    console.error('Error fetching book details:', error)
    return NextResponse.json({ error: 'Failed to fetch book details' }, { status: 500 })
  }
}

// Also create a GET endpoint to update existing books
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get all books without titles or covers
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .or('title.is.null,cover_url.is.null,title.eq.Book ' + 'B%')
      .limit(10) // Process 10 at a time
    
    if (error) {
      console.error('Error fetching books:', error)
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
    }

    if (!books || books.length === 0) {
      return NextResponse.json({ message: 'No books need updating' })
    }

    let updated = 0
    const debugInfo = []
    
    for (const book of books) {
      try {
        console.log(`Updating book ${book.asin} with Amazon PA-API...`)
        
        // Fetch details using Amazon PA-API
        const details = await getBookDetails(book.asin)
        
        // Add debug info
        debugInfo.push({
          asin: book.asin,
          amazonApiResponse: details,
          currentBookData: {
            title: book.title,
            author: book.author,
            cover_url: book.cover_url
          }
        })
        
        if (details) {
          // Update the book with new details
          const { error: updateError } = await supabase
            .from('books')
            .update({
              title: details.title || book.title,
              author: details.author || book.author,
              cover_url: details.cover_url || book.cover_url
            })
            .eq('id', book.id)
          
          if (!updateError) {
            updated++
            console.log(`Successfully updated book ${book.asin}`)
          } else {
            console.error(`Error updating book ${book.asin}:`, updateError)
          }
        }
        
        // Add delay to avoid rate limiting (Amazon PA-API has rate limits)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Error updating book ${book.asin}:`, error)
        debugInfo.push({
          asin: book.asin,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    return NextResponse.json({ 
      message: `Updated ${updated} books using Amazon PA-API`,
      processed: books.length,
      debugInfo: debugInfo
    })
    
  } catch (error) {
    console.error('Error in batch update:', error)
    return NextResponse.json({ error: 'Failed to update books' }, { status: 500 })
  }
} 