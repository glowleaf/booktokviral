import { NextRequest, NextResponse } from 'next/server'
import { fetchBookDetails } from '@/lib/amazon-api'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()

    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }

    // Validate ASIN format (10 characters, alphanumeric)
    if (!/^[A-Z0-9]{10}$/i.test(asin)) {
      return NextResponse.json({ error: 'Invalid ASIN format' }, { status: 400 })
    }

    console.log('Fetching book details for ASIN:', asin)

    try {
      const bookDetails = await fetchBookDetails(asin)
      console.log('Successfully fetched book details:', bookDetails)
      
      return NextResponse.json(bookDetails)
    } catch (apiError) {
      console.error('Amazon API error:', apiError)
      
      // Check if it's an API credentials issue
      if (apiError instanceof Error && apiError.message.includes('credentials not configured')) {
        return NextResponse.json({ 
          error: 'Amazon API not configured',
          details: 'Amazon Product Advertising API credentials are not set up'
        }, { status: 503 })
      }
      
      // Return a fallback response with just the ASIN
      return NextResponse.json({
        title: null,
        author: null,
        cover_url: null,
        asin: asin,
        error: 'Could not fetch book details from Amazon'
      })
    }
  } catch (error) {
    console.error('Error in fetch-book-details API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 