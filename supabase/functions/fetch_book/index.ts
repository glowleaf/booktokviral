import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { book_id } = await req.json()
    
    if (!book_id) {
      return new Response(
        JSON.stringify({ error: 'book_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the book's ASIN
    const { data: book, error: bookError } = await supabaseClient
      .from('books')
      .select('asin')
      .eq('id', book_id)
      .single()

    if (bookError || !book?.asin) {
      return new Response(
        JSON.stringify({ error: 'Book not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const asin = book.asin

    // Fetch Amazon page
    const amazonUrl = `https://www.amazon.com/dp/${asin}`
    const response = await fetch(amazonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 BookTokViral/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Amazon page: ${response.status}`)
    }

    const html = await response.text()

    // Extract book information using regex
    const titleMatch = /<span id="productTitle"[^>]*>\s*(.*?)\s*<\/span>/s.exec(html)
    const title = titleMatch?.[1]?.trim().replace(/\s+/g, ' ') || `Amazon Book ${asin}`

    // Try multiple author patterns
    const authorPatterns = [
      /<span class="author[^"]*">.*?<a[^>]*>(.*?)<\/a>/s,
      /<span class="a-size-medium a-color-secondary">\s*by\s*<a[^>]*>(.*?)<\/a>/s,
      /by\s*<a[^>]*class="[^"]*author[^"]*"[^>]*>(.*?)<\/a>/s
    ]
    
    let author = null
    for (const pattern of authorPatterns) {
      const match = pattern.exec(html)
      if (match) {
        author = match[1].trim().replace(/\s+/g, ' ')
        break
      }
    }

    // Extract cover image
    const coverPatterns = [
      /<meta property="og:image" content="([^"]+)"/,
      /<img[^>]*id="landingImage"[^>]*src="([^"]+)"/,
      /<img[^>]*data-old-hires="([^"]+)"/
    ]
    
    let cover_url = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`
    for (const pattern of coverPatterns) {
      const match = pattern.exec(html)
      if (match) {
        cover_url = match[1]
        break
      }
    }

    // Update the book in the database
    const { error: updateError } = await supabaseClient
      .from('books')
      .update({
        title,
        author,
        cover_url
      })
      .eq('id', book_id)

    if (updateError) {
      console.error('Error updating book:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update book' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully updated book ${book_id} with title: ${title}, author: ${author}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        book_id, 
        title, 
        author, 
        cover_url 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch_book function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 