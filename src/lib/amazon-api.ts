import { getFallbackBookData } from './book-data-fallback'

// Updated with new credentials - 2025-01-30
export interface BookDetails {
  title: string
  author: string
  cover_url: string | null
}

// Marketplace configurations
const MARKETPLACES = {
  'US': { host: 'webservices.amazon.com', region: 'us-east-1', marketplace: 'www.amazon.com' },
  'UK': { host: 'webservices.amazon.co.uk', region: 'eu-west-1', marketplace: 'www.amazon.co.uk' },
  'CA': { host: 'webservices.amazon.ca', region: 'us-east-1', marketplace: 'www.amazon.ca' },
  'DE': { host: 'webservices.amazon.de', region: 'eu-west-1', marketplace: 'www.amazon.de' },
}

// Dynamic import function that works in production
async function loadAmazonSDK() {
  // Only load on server side
  if (typeof window !== 'undefined') {
    return null
  }
  
  try {
    // Use eval to prevent webpack from analyzing this require
    const requireFunc = eval('require')
    const sdk = requireFunc('paapi5-nodejs-sdk')
    return sdk
  } catch (error) {
    console.log('[Amazon API] SDK not available:', error)
    return null
  }
}

export async function getBookDetails(asin: string): Promise<BookDetails | null> {
  try {
    console.log('[Amazon API] Starting request for ASIN:', asin)

    // Check fallback data first
    const fallbackData = getFallbackBookData(asin)
    if (fallbackData) {
      console.log('[Amazon API] Using fallback data for ASIN:', asin)
      return fallbackData
    }

    // Try to load Amazon SDK
    const ProductAdvertisingAPIv1 = await loadAmazonSDK()
    if (!ProductAdvertisingAPIv1) {
      console.log('[Amazon API] SDK not available, using default fallback')
      return {
        title: `Book ${asin}`,
        author: 'Unknown Author',
        cover_url: null
      }
    }

    // Validate credentials
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY || !process.env.AMAZON_PARTNER_TAG) {
      console.error('[Amazon API] Missing credentials')
      return {
        title: `Book ${asin}`,
        author: 'Unknown Author',
        cover_url: null
      }
    }

    console.log('[Amazon API] Credentials found, configuring client...')

    // Configure the API client
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    // Create GetItems request
    const getItemsRequest: any = {}
    getItemsRequest.PartnerTag = process.env.AMAZON_PARTNER_TAG
    getItemsRequest.PartnerType = 'Associates'
    getItemsRequest.Marketplace = 'www.amazon.com'
    getItemsRequest.ItemIds = [asin]
    getItemsRequest.ItemIdType = 'ASIN'
    getItemsRequest.Resources = [
      'Images.Primary.Large',
      'Images.Primary.Medium', 
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo'
    ]

    console.log('[Amazon API] Request prepared:', JSON.stringify(getItemsRequest, null, 2))

    // Make the API call
    const response = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout after 10 seconds'))
      }, 10000)

      api.getItems(getItemsRequest, (error: any, data: any) => {
        clearTimeout(timeout)
        if (error) {
          console.error('[Amazon API] Error response:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            response: error.response,
            responseBody: error.responseBody
          })
          reject(error)
        } else {
          console.log('[Amazon API] Success response received')
          resolve(data)
        }
      })
    })

    console.log('[Amazon API] Raw response:', JSON.stringify(response, null, 2))

    // Check if we got a valid response
    if (!response) {
      console.log('[Amazon API] No response from PA-API')
      return {
        title: `Book ${asin}`,
        author: 'Unknown Author',
        cover_url: null
      }
    }

    // Parse the response - PA-API returns PascalCase properties
    if (response.Errors && response.Errors.length > 0) {
      console.error('[Amazon API] Errors in response:', response.Errors)
      return {
        title: `Book ${asin}`,
        author: 'Unknown Author',
        cover_url: null
      }
    }
    
    // Check ItemsResult (PascalCase)
    if (response.ItemsResult && response.ItemsResult.Items && response.ItemsResult.Items.length > 0) {
      const item = response.ItemsResult.Items[0]
      console.log('[Amazon API] Processing item:', JSON.stringify(item, null, 2))
      
      // Extract title (PascalCase properties)
      let title = null
      if (item.ItemInfo && item.ItemInfo.Title && item.ItemInfo.Title.DisplayValue) {
        title = item.ItemInfo.Title.DisplayValue
        console.log('[Amazon API] Found title:', title)
      }
      
      // Extract author from contributors or brand
      let author = null
      if (item.ItemInfo && item.ItemInfo.ByLineInfo) {
        if (item.ItemInfo.ByLineInfo.Contributors && item.ItemInfo.ByLineInfo.Contributors.length > 0) {
          const contributor = item.ItemInfo.ByLineInfo.Contributors[0]
          if (contributor.Name) {
            author = contributor.Name
            console.log('[Amazon API] Found author:', author)
          }
        } else if (item.ItemInfo.ByLineInfo.Brand && item.ItemInfo.ByLineInfo.Brand.DisplayValue) {
          author = item.ItemInfo.ByLineInfo.Brand.DisplayValue
          console.log('[Amazon API] Found brand as author:', author)
        }
      }
      
      // Extract cover image (PascalCase)
      let cover_url = null
      if (item.Images && item.Images.Primary) {
        if (item.Images.Primary.Large && item.Images.Primary.Large.URL) {
          cover_url = item.Images.Primary.Large.URL
          console.log('[Amazon API] Found large cover:', cover_url)
        } else if (item.Images.Primary.Medium && item.Images.Primary.Medium.URL) {
          cover_url = item.Images.Primary.Medium.URL
          console.log('[Amazon API] Found medium cover:', cover_url)
        }
      }
      
      // Return with fallback values if needed
      const bookDetails = {
        title: title || `Book ${asin}`,
        author: author || 'Unknown Author',
        cover_url: cover_url
      }
      
      console.log('[Amazon API] Final book details:', bookDetails)
      return bookDetails
    }
    
    console.log('[Amazon API] No items in response')
    return {
      title: `Book ${asin}`,
      author: 'Unknown Author',
      cover_url: null
    }
    
  } catch (error: any) {
    console.error('[Amazon API] Exception:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response
    })
    
    // Return fallback data instead of null
    return {
      title: `Book ${asin}`,
      author: 'Unknown Author',
      cover_url: null
    }
  }
}

function generateDefaultBookDetails(asin: string): BookDetails {
  return {
    title: `Book ${asin}`,
    author: 'Unknown Author',
    cover_url: null
  }
} 