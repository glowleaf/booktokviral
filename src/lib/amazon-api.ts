const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk')
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

export async function getBookDetails(asin: string): Promise<BookDetails | null> {
  // Check fallback data first
  const fallbackData = getFallbackBookData(asin)
  if (fallbackData) {
    console.log('[Amazon API] Using fallback data for ASIN:', asin)
    return fallbackData
  }

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

    // Try SearchItems first (often works better than GetItems)
    const searchRequest = new ProductAdvertisingAPIv1.SearchItemsRequest()
    searchRequest['PartnerTag'] = process.env.AMAZON_PARTNER_TAG
    searchRequest['PartnerType'] = 'Associates'
    searchRequest['Marketplace'] = 'www.amazon.com'
    searchRequest['Keywords'] = asin  // Search by ASIN as keyword
    searchRequest['Resources'] = [
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'Images.Primary.Small',
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo',
      'ItemInfo.Features',
      'ItemInfo.ContentInfo'
    ]
    searchRequest['ItemCount'] = 1

    console.log('[Amazon API] Trying SearchItems with ASIN as keyword...')
    
    const searchResponse = await new Promise<any>((resolve, reject) => {
      api.searchItems(searchRequest, (error: any, data: any) => {
        if (error) {
          console.error('[Amazon API] SearchItems error:', error.message)
          reject(error)
        } else {
          resolve(data)
        }
      })
    }).catch(err => {
      console.log('[Amazon API] SearchItems failed, trying GetItems...')
      
      // Fallback to GetItems
      const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
      getItemsRequest['PartnerTag'] = process.env.AMAZON_PARTNER_TAG
      getItemsRequest['PartnerType'] = 'Associates'
      getItemsRequest['Marketplace'] = 'www.amazon.com'
      getItemsRequest['ItemIds'] = [asin]
      getItemsRequest['Resources'] = [
        'Images.Primary.Large',
        'Images.Primary.Medium',
        'Images.Primary.Small',
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'ItemInfo.Features',
        'ItemInfo.ContentInfo'
      ]
      
      return new Promise<any>((resolve, reject) => {
        api.getItems(getItemsRequest, (error: any, data: any) => {
          if (error) {
            console.error('[Amazon API] GetItems error:', error.message)
            reject(error)
          } else {
            resolve(data)
          }
        })
      })
    })

    // Process response
    let items = []
    if (searchResponse?.SearchResult?.Items) {
      items = searchResponse.SearchResult.Items
      console.log('[Amazon API] Found items via SearchItems')
    } else if (searchResponse?.ItemsResult?.Items) {
      items = searchResponse.ItemsResult.Items
      console.log('[Amazon API] Found items via GetItems')
    }

    if (items.length === 0) {
      console.log('[Amazon API] No items found')
      return null
    }

    // Find the exact ASIN match
    let item = items.find((i: any) => i.ASIN === asin) || items[0]
    
    // Extract book details
    let title = null
    let author = null
    let cover_url = null

    // Get title
    if (item.ItemInfo?.Title?.DisplayValue) {
      title = item.ItemInfo.Title.DisplayValue
    }

    // Get author
    if (item.ItemInfo?.ByLineInfo?.Contributors?.length > 0) {
      const contributors = item.ItemInfo.ByLineInfo.Contributors
      author = contributors.map((c: any) => c.Name).join(', ')
    } else if (item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue) {
      author = item.ItemInfo.ByLineInfo.Brand.DisplayValue
    }

    // Get cover image - try all sizes
    if (item.Images?.Primary?.Large?.URL) {
      cover_url = item.Images.Primary.Large.URL
    } else if (item.Images?.Primary?.Medium?.URL) {
      cover_url = item.Images.Primary.Medium.URL
    } else if (item.Images?.Primary?.Small?.URL) {
      cover_url = item.Images.Primary.Small.URL
    }

    const bookDetails = {
      title: title || `Book ${asin}`,
      author: author || 'Unknown Author',
      cover_url: cover_url
    }

    console.log('[Amazon API] Extracted:', bookDetails)
    console.log('[Amazon API] ============================================')
    
    return bookDetails

  } catch (error: any) {
    console.error('[Amazon API] Exception:', error.message)
    
    // Last resort - try direct URL construction
    console.log('[Amazon API] Attempting direct image URL construction...')
    
    // Amazon often uses predictable image URLs
    const possibleImageUrl = `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`
    
    return {
      title: `Book ${asin}`,
      author: 'Unknown Author',
      cover_url: possibleImageUrl
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