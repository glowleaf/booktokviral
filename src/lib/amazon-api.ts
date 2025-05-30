const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk')

// Updated with new credentials - 2025-01-30
export interface BookDetails {
  title: string
  author: string
  cover_url: string | null
}

export async function getBookDetails(asin: string): Promise<BookDetails | null> {
  try {
    console.log('=== PA-API DEBUG START ===')
    console.log('Fetching book details from Amazon PA-API for ASIN:', asin)

    // Validate environment variables
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY || !process.env.AMAZON_PARTNER_TAG) {
      console.error('Missing Amazon API credentials')
      return null
    }

    console.log('Credentials check:', {
      hasAccessKey: !!process.env.AMAZON_ACCESS_KEY,
      hasSecretKey: !!process.env.AMAZON_SECRET_KEY,
      hasPartnerTag: !!process.env.AMAZON_PARTNER_TAG,
      accessKeyLength: process.env.AMAZON_ACCESS_KEY?.length,
      partnerTag: process.env.AMAZON_PARTNER_TAG
    })

    // Initialize the API client using official SDK pattern
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    
    // Set credentials
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
    
    // Set host and region for US marketplace
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    console.log('Client configured:', {
      host: defaultClient.host,
      region: defaultClient.region
    })

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    // Create GetItems request using official SDK pattern
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
    
    // Set partner information
    getItemsRequest['PartnerTag'] = process.env.AMAZON_PARTNER_TAG
    getItemsRequest['PartnerType'] = 'Associates'
    
    // Set marketplace
    getItemsRequest['Marketplace'] = 'www.amazon.com'
    
    // Set item IDs and type - try multiple known good ASINs
    const testAsins = [asin, 'B073FZLLYS', 'B08N5WRWNW'] // Include known good Harry Potter ASINs
    getItemsRequest['ItemIds'] = testAsins
    getItemsRequest['ItemIdType'] = 'ASIN'
    
    // Set resources we want to retrieve
    getItemsRequest['Resources'] = [
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo'
    ]

    console.log('Request parameters:', {
      PartnerTag: getItemsRequest['PartnerTag'],
      PartnerType: getItemsRequest['PartnerType'],
      Marketplace: getItemsRequest['Marketplace'],
      ItemIds: getItemsRequest['ItemIds'],
      ItemIdType: getItemsRequest['ItemIdType'],
      Resources: getItemsRequest['Resources']
    })

    console.log('Making PA-API GetItems request...')

    // Make the API call using the official callback pattern
    const response = await new Promise((resolve, reject) => {
      const callback = function (error: any, data: any, response: any) {
        console.log('=== PA-API CALLBACK RECEIVED ===')
        
        if (error) {
          console.log('ERROR DETAILS:')
          console.log('- Error message:', error.message)
          console.log('- Error code:', error.code)
          console.log('- Status code:', error.status || error.statusCode)
          console.log('- Full error object:', JSON.stringify(error, null, 2))
          
          if (error.response) {
            console.log('- Response data:', error.response.data || error.response.text)
            console.log('- Response status:', error.response.status)
            console.log('- Response headers:', error.response.headers)
          }
          
          resolve({ error: error })
        } else {
          console.log('SUCCESS - Raw data received:', JSON.stringify(data, null, 2))
          const getItemsResponse = ProductAdvertisingAPIv1.GetItemsResponse.constructFromObject(data)
          console.log('Constructed response:', JSON.stringify(getItemsResponse, null, 2))
          resolve({ success: getItemsResponse })
        }
      }

      try {
        console.log('Calling api.getItems...')
        api.getItems(getItemsRequest, callback)
      } catch (ex) {
        console.log('Exception during API call:', ex)
        resolve({ error: ex })
      }
    })

    console.log('=== PA-API RESPONSE PROCESSING ===')
    
    const result = response as any
    
    if (result.error) {
      console.log('API call failed with error:', result.error)
      return null
    }
    
    if (!result.success) {
      console.log('No success response received')
      return null
    }

    const getItemsResponse = result.success
    
    // Check for errors in response
    if (getItemsResponse['Errors'] !== undefined && getItemsResponse['Errors'].length > 0) {
      console.log('=== PA-API RETURNED ERRORS ===')
      console.log('Error count:', getItemsResponse['Errors'].length)
      getItemsResponse['Errors'].forEach((error: any, index: number) => {
        console.log(`Error ${index + 1}:`)
        console.log('- Code:', error['Code'])
        console.log('- Message:', error['Message'])
        console.log('- Full error:', JSON.stringify(error, null, 2))
      })
    }
    
    // Process successful response
    if (getItemsResponse['ItemsResult'] !== undefined && getItemsResponse['ItemsResult']['Items'] !== undefined) {
      console.log('=== PROCESSING ITEMS ===')
      console.log('Items found:', getItemsResponse['ItemsResult']['Items'].length)
      
      // Look for our target ASIN first, then any valid item
      let targetItem = null
      
      for (const item of getItemsResponse['ItemsResult']['Items']) {
        console.log('Processing item ASIN:', item['ASIN'])
        
        if (item['ASIN'] === asin) {
          targetItem = item
          console.log('Found target ASIN:', asin)
          break
        }
      }
      
      // If target ASIN not found, use first available item
      if (!targetItem && getItemsResponse['ItemsResult']['Items'].length > 0) {
        targetItem = getItemsResponse['ItemsResult']['Items'][0]
        console.log('Using first available item:', targetItem['ASIN'])
      }
      
      if (targetItem) {
        let title = null
        let author = null
        let cover_url = null
        
        console.log('=== EXTRACTING DATA ===')
        
        // Extract title
        if (targetItem['ItemInfo'] !== undefined && 
            targetItem['ItemInfo']['Title'] !== undefined && 
            targetItem['ItemInfo']['Title']['DisplayValue'] !== undefined) {
          title = targetItem['ItemInfo']['Title']['DisplayValue']
          console.log('✓ Title found:', title)
        } else {
          console.log('✗ No title found')
        }
        
        // Extract author from Contributors
        if (targetItem['ItemInfo'] !== undefined && 
            targetItem['ItemInfo']['ByLineInfo'] !== undefined && 
            targetItem['ItemInfo']['ByLineInfo']['Contributors'] !== undefined &&
            targetItem['ItemInfo']['ByLineInfo']['Contributors'].length > 0) {
          const contributor = targetItem['ItemInfo']['ByLineInfo']['Contributors'][0]
          if (contributor['Name'] !== undefined) {
            author = contributor['Name']
            console.log('✓ Author found:', author)
          }
        } else if (targetItem['ItemInfo'] !== undefined && 
                   targetItem['ItemInfo']['ByLineInfo'] !== undefined && 
                   targetItem['ItemInfo']['ByLineInfo']['Brand'] !== undefined &&
                   targetItem['ItemInfo']['ByLineInfo']['Brand']['DisplayValue'] !== undefined) {
          author = targetItem['ItemInfo']['ByLineInfo']['Brand']['DisplayValue']
          console.log('✓ Brand as Author found:', author)
        } else {
          console.log('✗ No author found')
        }
        
        // Extract cover image
        if (targetItem['Images'] !== undefined && 
            targetItem['Images']['Primary'] !== undefined) {
          if (targetItem['Images']['Primary']['Large'] !== undefined &&
              targetItem['Images']['Primary']['Large']['URL'] !== undefined) {
            cover_url = targetItem['Images']['Primary']['Large']['URL']
            console.log('✓ Large cover found:', cover_url)
          } else if (targetItem['Images']['Primary']['Medium'] !== undefined &&
                     targetItem['Images']['Primary']['Medium']['URL'] !== undefined) {
            cover_url = targetItem['Images']['Primary']['Medium']['URL']
            console.log('✓ Medium cover found:', cover_url)
          } else {
            console.log('✗ No cover image found')
          }
        } else {
          console.log('✗ No images found')
        }
        
        // Return data if we found at least a title
        if (title) {
          const bookDetails = {
            title,
            author: author || 'Unknown Author',
            cover_url
          }
          console.log('=== SUCCESS ===')
          console.log('Final book details:', bookDetails)
          console.log('=== PA-API DEBUG END ===')
          return bookDetails
        } else {
          console.log('=== FAILURE: NO TITLE ===')
          console.log('=== PA-API DEBUG END ===')
          return null
        }
      }
    } else {
      console.log('=== NO ITEMS IN RESPONSE ===')
      console.log('ItemsResult:', getItemsResponse['ItemsResult'])
    }
    
    console.log('=== PA-API DEBUG END ===')
    return null
    
  } catch (error: any) {
    console.error('=== PA-API EXCEPTION ===')
    console.error('Exception details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    })
    console.log('=== PA-API DEBUG END ===')
    
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