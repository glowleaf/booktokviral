const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk')

// Updated with new credentials - 2025-01-30
export interface BookDetails {
  title: string
  author: string
  cover_url: string | null
}

export async function getBookDetails(asin: string): Promise<BookDetails | null> {
  try {
    console.log('Fetching book details from Amazon PA-API for ASIN:', asin)

    // Validate environment variables
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY || !process.env.AMAZON_PARTNER_TAG) {
      console.error('Missing Amazon API credentials')
      return null
    }

    // Initialize the API client with proper configuration
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    // Create the request with proper structure
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
    getItemsRequest.partnerTag = process.env.AMAZON_PARTNER_TAG
    getItemsRequest.partnerType = ProductAdvertisingAPIv1.PartnerType.Associates
    getItemsRequest.marketplace = 'www.amazon.com'
    getItemsRequest.itemIds = [asin]
    getItemsRequest.itemIdType = ProductAdvertisingAPIv1.ItemIdType.ASIN
    
    // Request essential resources
    getItemsRequest.resources = [
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo'
    ]

    console.log('Making PA-API request for ASIN:', asin)

    // Make the API call with proper error handling
    const response = await new Promise((resolve, reject) => {
      api.getItems(getItemsRequest, (error: any, data: any, response: any) => {
        if (error) {
          console.error('PA-API Error:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            responseBody: error.response
          })
          resolve(null)
        } else {
          console.log('PA-API Success - Raw response:', JSON.stringify(data, null, 2))
          resolve(data)
        }
      })
    })

    if (!response) {
      console.log('PA-API returned null/error for ASIN:', asin)
      return null
    }

    const responseData = response as any
    
    // Check for API errors in response
    if (responseData.Errors && responseData.Errors.length > 0) {
      console.error('PA-API Response Errors:', responseData.Errors)
      return null
    }
    
    // Process successful response
    if (responseData.ItemsResult?.Items && responseData.ItemsResult.Items.length > 0) {
      const item = responseData.ItemsResult.Items[0]
      console.log('Processing item:', JSON.stringify(item, null, 2))
      
      // Extract title
      let title = null
      if (item.ItemInfo?.Title?.DisplayValue) {
        title = item.ItemInfo.Title.DisplayValue
        console.log('Extracted title:', title)
      }
      
      // Extract author
      let author = null
      if (item.ItemInfo?.ByLineInfo?.Contributors && item.ItemInfo.ByLineInfo.Contributors.length > 0) {
        const contributor = item.ItemInfo.ByLineInfo.Contributors[0]
        if (contributor.Name) {
          author = contributor.Name
          console.log('Extracted author:', author)
        }
      } else if (item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue) {
        author = item.ItemInfo.ByLineInfo.Brand.DisplayValue
        console.log('Extracted brand as author:', author)
      }
      
      // Extract cover image
      let cover_url = null
      if (item.Images?.Primary?.Large?.URL) {
        cover_url = item.Images.Primary.Large.URL
        console.log('Extracted large cover:', cover_url)
      } else if (item.Images?.Primary?.Medium?.URL) {
        cover_url = item.Images.Primary.Medium.URL
        console.log('Extracted medium cover:', cover_url)
      }
      
      // Return data if we found at least a title
      if (title) {
        const bookDetails = {
          title,
          author: author || 'Unknown Author',
          cover_url
        }
        console.log('Successfully extracted book details:', bookDetails)
        return bookDetails
      } else {
        console.log('No title found in PA-API response for ASIN:', asin)
        return null
      }
    }
    
    console.log('No items found in PA-API response for ASIN:', asin)
    return null
    
  } catch (error: any) {
    console.error('Amazon PA-API exception for ASIN', asin, ':', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    })
    
    return null
  }
}

function generateDefaultBookDetails(asin: string): BookDetails {
  return {
    title: `Book ${asin}`,
    author: 'Unknown Author',
    cover_url: null
  }
} 