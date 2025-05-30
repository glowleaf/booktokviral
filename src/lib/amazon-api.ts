const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk')

// Updated with new credentials - 2025-01-30
export interface BookDetails {
  title: string
  author: string
  cover_url: string | null
}

export async function getBookDetails(asin: string): Promise<BookDetails | null> {
  try {
    console.log('Fetching book details for ASIN:', asin)

    // FORCE FALLBACK METHOD FIRST - bypass PA-API issues
    console.log('Using fallback method to ensure book data is fetched')
    const fallbackResult = await fallbackBookDetails(asin)
    if (fallbackResult && fallbackResult.title !== `Book ${asin}`) {
      console.log('Fallback method successful, returning:', fallbackResult)
      return fallbackResult
    }

    // Validate environment variables
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY || !process.env.AMAZON_PARTNER_TAG) {
      console.error('Missing Amazon API credentials. Required: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG')
      return fallbackResult || generateDefaultBookDetails(asin)
    }

    // Initialize the API client
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    // Create the request according to PA-API 5.0 documentation
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
    getItemsRequest.partnerTag = process.env.AMAZON_PARTNER_TAG
    getItemsRequest.partnerType = ProductAdvertisingAPIv1.PartnerType.Associates
    getItemsRequest.marketplace = 'www.amazon.com'
    getItemsRequest.itemIds = [asin]
    getItemsRequest.itemIdType = ProductAdvertisingAPIv1.ItemIdType.ASIN
    
    // Request specific resources as per documentation
    getItemsRequest.resources = [
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'Images.Primary.Small', 
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo'
    ]

    console.log('Making PA-API request with:', {
      partnerTag: getItemsRequest.partnerTag,
      marketplace: getItemsRequest.marketplace,
      itemIds: getItemsRequest.itemIds,
      resources: getItemsRequest.resources
    })

    const response = await new Promise((resolve, reject) => {
      api.getItems(getItemsRequest, (error: any, data: any) => {
        if (error) {
          console.error('Amazon PA-API callback error:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            response: error.response
          })
          reject(error)
        } else {
          console.log('Amazon PA-API response received successfully')
          resolve(data)
        }
      })
    })

    const responseData = response as any
    console.log('PA-API Response structure:', JSON.stringify(responseData, null, 2))
    
    // Handle errors in response as per documentation
    if (responseData.Errors && responseData.Errors.length > 0) {
      console.error('PA-API returned errors:', responseData.Errors)
      
      // Check for specific error codes mentioned in documentation
      const hasAccessDenied = responseData.Errors.some((err: any) => 
        err.Code === 'AccessDeniedException' || err.Code === 'AccessDeniedAwsUsers'
      )
      
      if (hasAccessDenied) {
        console.error('Access denied - credentials may need migration. Check Associates Central.')
      }
      
      const hasNoResults = responseData.Errors.some((err: any) => err.Code === 'NoResults')
      if (hasNoResults) {
        console.log('No results found for ASIN:', asin)
      }
      
      return fallbackResult || generateDefaultBookDetails(asin)
    }
    
    // Process successful response
    if (responseData.ItemsResult?.Items && responseData.ItemsResult.Items.length > 0) {
      const item = responseData.ItemsResult.Items[0]
      console.log('Processing item:', JSON.stringify(item, null, 2))
      
      // Extract title
      let title = 'Unknown Title'
      if (item.ItemInfo?.Title?.DisplayValue) {
        title = item.ItemInfo.Title.DisplayValue
      }
      
      // Extract author - check Contributors array as per documentation
      let author = 'Unknown Author'
      if (item.ItemInfo?.ByLineInfo?.Contributors && item.ItemInfo.ByLineInfo.Contributors.length > 0) {
        // Get the first contributor (usually the author)
        const contributor = item.ItemInfo.ByLineInfo.Contributors[0]
        if (contributor.Name) {
          author = contributor.Name
        }
      } else if (item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue) {
        author = item.ItemInfo.ByLineInfo.Brand.DisplayValue
      }
      
      // Extract cover image - try different sizes as per documentation
      let cover_url = null
      if (item.Images?.Primary?.Large?.URL) {
        cover_url = item.Images.Primary.Large.URL
      } else if (item.Images?.Primary?.Medium?.URL) {
        cover_url = item.Images.Primary.Medium.URL
      } else if (item.Images?.Primary?.Small?.URL) {
        cover_url = item.Images.Primary.Small.URL
      }
      
      console.log('Successfully extracted book details:', { title, author, cover_url })
      
      return {
        title,
        author,
        cover_url
      }
    }
    
    console.log('No items found in PA-API response for ASIN:', asin)
    return fallbackResult || generateDefaultBookDetails(asin)
    
  } catch (error: any) {
    console.error('Amazon PA-API error for ASIN', asin, ':', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    })
    
    // Check for rate limiting as mentioned in documentation
    if (error.statusCode === 429) {
      console.error('Rate limit exceeded - TooManyRequests error')
    }
    
    const fallbackResult = await fallbackBookDetails(asin)
    return fallbackResult || generateDefaultBookDetails(asin)
  }
}

async function fallbackBookDetails(asin: string): Promise<BookDetails | null> {
  try {
    console.log('Attempting fallback book details fetch for ASIN:', asin)
    
    // Try to fetch from Amazon product page directly
    const amazonUrl = `https://www.amazon.com/dp/${asin}`
    const response = await fetch(amazonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch Amazon page:', response.status)
      return generateDefaultBookDetails(asin)
    }

    const html = await response.text()

    // Extract title
    const titleMatch = /<span id="productTitle"[^>]*>\s*(.*?)\s*<\/span>/i.exec(html)
    const title = titleMatch?.[1]?.trim().replace(/\s+/g, ' ') || `Book ${asin}`

    // Extract author
    const authorPatterns = [
      /<span class="author[^"]*">.*?<a[^>]*>(.*?)<\/a>/i,
      /<span class="a-size-medium a-color-secondary">\s*by\s*<a[^>]*>(.*?)<\/a>/i,
      /by\s*<a[^>]*class="[^"]*author[^"]*"[^>]*>(.*?)<\/a>/i
    ]
    
    let author = 'Unknown Author'
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

    console.log('Fallback fetch successful:', { title, author, cover_url })

    return {
      title,
      author,
      cover_url
    }

  } catch (error) {
    console.error('Fallback fetch failed for ASIN', asin, ':', error)
    return generateDefaultBookDetails(asin)
  }
}

function generateDefaultBookDetails(asin: string): BookDetails {
  return {
    title: `Book ${asin}`,
    author: 'Unknown Author',
    cover_url: `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`
  }
} 