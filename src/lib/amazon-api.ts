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

    // Initialize the API client using official SDK pattern
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    
    // Set credentials
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
    
    // Set host and region for US marketplace
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    // Create GetItems request using official SDK pattern
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
    
    // Set partner information
    getItemsRequest['PartnerTag'] = process.env.AMAZON_PARTNER_TAG
    getItemsRequest['PartnerType'] = 'Associates'
    
    // Set marketplace
    getItemsRequest['Marketplace'] = 'www.amazon.com'
    
    // Set item IDs and type
    getItemsRequest['ItemIds'] = [asin]
    getItemsRequest['ItemIdType'] = 'ASIN'
    
    // Set resources we want to retrieve
    getItemsRequest['Resources'] = [
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo'
    ]

    console.log('Making PA-API GetItems request for ASIN:', asin)

    // Make the API call using the official callback pattern
    const response = await new Promise((resolve, reject) => {
      const callback = function (error: any, data: any, response: any) {
        if (error) {
          console.log('Error calling PA-API 5.0!')
          console.log('Printing Full Error Object:', JSON.stringify(error, null, 1))
          console.log('Status Code:', error['status'])
          if (error['response'] !== undefined && error['response']['text'] !== undefined) {
            console.log('Error Object:', JSON.stringify(error['response']['text'], null, 1))
          }
          resolve(null)
        } else {
          console.log('API called successfully.')
          const getItemsResponse = ProductAdvertisingAPIv1.GetItemsResponse.constructFromObject(data)
          console.log('Complete Response:', JSON.stringify(getItemsResponse, null, 1))
          resolve(getItemsResponse)
        }
      }

      try {
        api.getItems(getItemsRequest, callback)
      } catch (ex) {
        console.log('Exception:', ex)
        resolve(null)
      }
    })

    if (!response) {
      console.log('PA-API returned null/error for ASIN:', asin)
      return null
    }

    const getItemsResponse = response as any
    
    // Check for errors in response
    if (getItemsResponse['Errors'] !== undefined) {
      console.log('Errors:')
      console.log('Complete Error Response:', JSON.stringify(getItemsResponse['Errors'], null, 1))
      console.log('Printing 1st Error:')
      const error_0 = getItemsResponse['Errors'][0]
      console.log('Error Code:', error_0['Code'])
      console.log('Error Message:', error_0['Message'])
      return null
    }
    
    // Process successful response
    if (getItemsResponse['ItemsResult'] !== undefined && getItemsResponse['ItemsResult']['Items'] !== undefined) {
      console.log('Printing First Item Information in ItemsResult:')
      const item_0 = getItemsResponse['ItemsResult']['Items'][0]
      
      if (item_0 !== undefined) {
        let title = null
        let author = null
        let cover_url = null
        
        // Extract ASIN
        if (item_0['ASIN'] !== undefined) {
          console.log('ASIN:', item_0['ASIN'])
        }
        
        // Extract title
        if (item_0['ItemInfo'] !== undefined && 
            item_0['ItemInfo']['Title'] !== undefined && 
            item_0['ItemInfo']['Title']['DisplayValue'] !== undefined) {
          title = item_0['ItemInfo']['Title']['DisplayValue']
          console.log('Title:', title)
        }
        
        // Extract author from Contributors
        if (item_0['ItemInfo'] !== undefined && 
            item_0['ItemInfo']['ByLineInfo'] !== undefined && 
            item_0['ItemInfo']['ByLineInfo']['Contributors'] !== undefined &&
            item_0['ItemInfo']['ByLineInfo']['Contributors'].length > 0) {
          const contributor = item_0['ItemInfo']['ByLineInfo']['Contributors'][0]
          if (contributor['Name'] !== undefined) {
            author = contributor['Name']
            console.log('Author:', author)
          }
        } else if (item_0['ItemInfo'] !== undefined && 
                   item_0['ItemInfo']['ByLineInfo'] !== undefined && 
                   item_0['ItemInfo']['ByLineInfo']['Brand'] !== undefined &&
                   item_0['ItemInfo']['ByLineInfo']['Brand']['DisplayValue'] !== undefined) {
          author = item_0['ItemInfo']['ByLineInfo']['Brand']['DisplayValue']
          console.log('Brand as Author:', author)
        }
        
        // Extract cover image
        if (item_0['Images'] !== undefined && 
            item_0['Images']['Primary'] !== undefined) {
          if (item_0['Images']['Primary']['Large'] !== undefined &&
              item_0['Images']['Primary']['Large']['URL'] !== undefined) {
            cover_url = item_0['Images']['Primary']['Large']['URL']
            console.log('Large Cover URL:', cover_url)
          } else if (item_0['Images']['Primary']['Medium'] !== undefined &&
                     item_0['Images']['Primary']['Medium']['URL'] !== undefined) {
            cover_url = item_0['Images']['Primary']['Medium']['URL']
            console.log('Medium Cover URL:', cover_url)
          }
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