const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk')

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

export async function getBookDetails(asin: string): Promise<BookDetails | null> {
  try {
    console.log('[Amazon API] ============================================')
    console.log('[Amazon API] Starting request for ASIN:', asin)
    console.log('[Amazon API] Timestamp:', new Date().toISOString())

    // Validate credentials
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY || !process.env.AMAZON_PARTNER_TAG) {
      console.error('[Amazon API] Missing credentials')
      return null
    }

    console.log('[Amazon API] Credentials present:')
    console.log('  - Access Key:', process.env.AMAZON_ACCESS_KEY?.substring(0, 10) + '...')
    console.log('  - Partner Tag:', process.env.AMAZON_PARTNER_TAG)

    // Configure the API client
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    // Create GetItems request
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
    
    getItemsRequest['PartnerTag'] = process.env.AMAZON_PARTNER_TAG
    getItemsRequest['PartnerType'] = 'Associates'
    getItemsRequest['Marketplace'] = 'www.amazon.com'
    getItemsRequest['ItemIds'] = [asin]
    getItemsRequest['ItemIdType'] = 'ASIN'
    getItemsRequest['Resources'] = [
      'Images.Primary.Large',
      'Images.Primary.Medium', 
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo',
      'ItemInfo.ContentInfo',
      'ItemInfo.Features',
      'ItemInfo.ProductInfo',
      'Offers.Listings.Price'
    ]

    console.log('[Amazon API] Request object:', JSON.stringify({
      PartnerTag: getItemsRequest.PartnerTag,
      PartnerType: getItemsRequest.PartnerType,
      Marketplace: getItemsRequest.Marketplace,
      ItemIds: getItemsRequest.ItemIds,
      Resources: getItemsRequest.Resources
    }, null, 2))

    // Make the API call
    const response = await new Promise<any>((resolve, reject) => {
      console.log('[Amazon API] Sending request...')
      api.getItems(getItemsRequest, (error: any, data: any, response: any) => {
        if (error) {
          console.error('[Amazon API] ❌ API Error:', error.message)
          console.error('[Amazon API] Error code:', error.code)
          console.error('[Amazon API] Status code:', error.statusCode)
          
          if (error.response && error.response.text) {
            try {
              const errorBody = JSON.parse(error.response.text)
              console.error('[Amazon API] Error response body:', JSON.stringify(errorBody, null, 2))
            } catch (e) {
              console.error('[Amazon API] Raw error response:', error.response.text)
            }
          }
          reject(error)
        } else {
          console.log('[Amazon API] ✅ API Success')
          console.log('[Amazon API] Response status:', response?.statusCode)
          resolve(data)
        }
      })
    })

    console.log('[Amazon API] Response received:', JSON.stringify(response, null, 2))

    // Check for valid response
    if (!response) {
      console.log('[Amazon API] ⚠️ Empty response from PA-API')
      return null
    }

    // Check for errors
    if (response.Errors && response.Errors.length > 0) {
      console.error('[Amazon API] ⚠️ Response contains errors:')
      response.Errors.forEach((err: any, index: number) => {
        console.error(`[Amazon API] Error ${index + 1}:`, {
          Code: err.Code,
          Message: err.Message,
          Type: err.__type
        })
      })
      return null
    }
    
    // Check ItemsResult
    if (!response.ItemsResult) {
      console.log('[Amazon API] ⚠️ No ItemsResult in response')
      return null
    }

    if (!response.ItemsResult.Items || response.ItemsResult.Items.length === 0) {
      console.log('[Amazon API] ⚠️ No items found for ASIN:', asin)
      return null
    }

    const item = response.ItemsResult.Items[0]
    console.log('[Amazon API] 📦 Item found!')
    console.log('[Amazon API] Item structure:', JSON.stringify(item, null, 2))
    
    // Extract data with detailed logging
    let title = null
    let author = null
    let cover_url = null

    // Title extraction
    if (item.ItemInfo?.Title?.DisplayValue) {
      title = item.ItemInfo.Title.DisplayValue
      console.log('[Amazon API] ✅ Title found:', title)
    } else {
      console.log('[Amazon API] ❌ No title found in ItemInfo.Title.DisplayValue')
    }
    
    // Author extraction
    if (item.ItemInfo?.ByLineInfo?.Contributors?.length > 0) {
      author = item.ItemInfo.ByLineInfo.Contributors[0].Name
      console.log('[Amazon API] ✅ Author found:', author)
    } else if (item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue) {
      author = item.ItemInfo.ByLineInfo.Brand.DisplayValue
      console.log('[Amazon API] ✅ Brand as author:', author)
    } else {
      console.log('[Amazon API] ❌ No author found')
    }
    
    // Cover image extraction
    if (item.Images?.Primary?.Large?.URL) {
      cover_url = item.Images.Primary.Large.URL
      console.log('[Amazon API] ✅ Large cover found:', cover_url)
    } else if (item.Images?.Primary?.Medium?.URL) {
      cover_url = item.Images.Primary.Medium.URL
      console.log('[Amazon API] ✅ Medium cover found:', cover_url)
    } else {
      console.log('[Amazon API] ❌ No cover image found')
    }
    
    const bookDetails = {
      title: title || `Book ${asin}`,
      author: author || 'Unknown Author',
      cover_url: cover_url
    }
    
    console.log('[Amazon API] Final book details:', bookDetails)
    console.log('[Amazon API] ============================================')
    
    return bookDetails
    
  } catch (error: any) {
    console.error('[Amazon API] 💥 Exception caught:', error.message)
    console.error('[Amazon API] Stack trace:', error.stack)
    
    // Return fallback data
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