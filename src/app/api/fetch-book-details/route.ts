import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }

    console.log('Fetching book details for ASIN:', asin)

    // Try to fetch from Amazon product page
    const amazonUrl = `https://www.amazon.com/dp/${asin}`
    
    try {
      const response = await fetch(amazonUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (response.ok) {
        const html = await response.text()
        
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        let title = titleMatch ? titleMatch[1].replace(' : Amazon.com: Books', '').replace(' - Amazon.com', '').trim() : null
        
        // Clean up title
        if (title) {
          title = title.split(' : ')[0] // Remove subtitle after colon
          title = title.replace(/\s+/g, ' ').trim() // Clean whitespace
        }
        
        // Extract author from various possible patterns
        let author = null
        const authorPatterns = [
          /"author":"([^"]+)"/,
          /by\s+([^<]+)</i,
          /"contributorName":"([^"]+)"/
        ]
        
        for (const pattern of authorPatterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            author = match[1].trim()
            break
          }
        }
        
        // Extract cover image
        let cover_url = null
        const imagePatterns = [
          /"largeImage":"([^"]+)"/,
          /"hiRes":"([^"]+)"/,
          /data-old-hires="([^"]+)"/,
          /data-a-dynamic-image="[^"]*"([^"]+)":[^}]+}/
        ]
        
        for (const pattern of imagePatterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            cover_url = match[1].replace(/\\u002F/g, '/').replace(/\\/g, '')
            if (cover_url.startsWith('http')) {
              break
            }
          }
        }
        
        // If we got some data, return it
        if (title || author || cover_url) {
          console.log('Successfully fetched book details:', { title, author, cover_url })
          return NextResponse.json({
            title: title || `Book ${asin}`,
            author: author || 'Unknown Author',
            cover_url: cover_url || null
          })
        }
      }
    } catch (error) {
      console.log('Amazon fetch failed, trying fallback:', error)
    }

    // Fallback: Generate basic info
    console.log('Using fallback book details for ASIN:', asin)
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
    
    // Get all books without titles
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .or('title.is.null,cover_url.is.null')
      .limit(10) // Process 10 at a time
    
    if (error) {
      console.error('Error fetching books:', error)
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
    }

    if (!books || books.length === 0) {
      return NextResponse.json({ message: 'No books need updating' })
    }

    let updated = 0
    
    for (const book of books) {
      try {
        // Fetch details for this book
        const detailsResponse = await fetch(`${request.nextUrl.origin}/api/fetch-book-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asin: book.asin })
        })
        
        if (detailsResponse.ok) {
          const details = await detailsResponse.json()
          
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
            console.log(`Updated book ${book.asin} with details`)
          }
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Error updating book ${book.asin}:`, error)
      }
    }
    
    return NextResponse.json({ 
      message: `Updated ${updated} books`,
      processed: books.length 
    })
    
  } catch (error) {
    console.error('Error in batch update:', error)
    return NextResponse.json({ error: 'Failed to update books' }, { status: 500 })
  }
} 