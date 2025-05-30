const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk')

const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
defaultClient.host = 'webservices.amazon.com'
defaultClient.region = 'us-east-1'

const api = new ProductAdvertisingAPIv1.DefaultApi()

export interface BookDetails {
  title: string
  author: string
  cover_url: string | null
}

export async function getBookDetails(asin: string): Promise<BookDetails | null> {
  try {
    console.log('Fetching book details from Amazon PA-API for ASIN:', asin)

    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
    getItemsRequest.partnerTag = process.env.AMAZON_PARTNER_TAG || 'booktokviral-20'
    getItemsRequest.partnerType = ProductAdvertisingAPIv1.PartnerType.Associates
    getItemsRequest.marketplace = 'www.amazon.com'
    getItemsRequest.itemIds = [asin]
    getItemsRequest.itemIdType = ProductAdvertisingAPIv1.ItemIdType.ASIN
    getItemsRequest.resources = [
      'Images.Primary.Large',
      'Images.Primary.Medium', 
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo',
      'ItemInfo.ContentInfo'
    ]

    const response = await new Promise((resolve, reject) => {
      api.getItems(getItemsRequest, (error: any, data: any) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })

    const responseData = response as any
    
    if (responseData.ItemsResult?.Items && responseData.ItemsResult.Items.length > 0) {
      const item = responseData.ItemsResult.Items[0]
      
      // Extract title
      let title = 'Unknown Title'
      if (item.ItemInfo?.Title?.DisplayValue) {
        title = item.ItemInfo.Title.DisplayValue
      }
      
      // Extract author
      let author = 'Unknown Author'
      if (item.ItemInfo?.ByLineInfo?.Contributors && item.ItemInfo.ByLineInfo.Contributors.length > 0) {
        author = item.ItemInfo.ByLineInfo.Contributors[0].Name
      } else if (item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue) {
        author = item.ItemInfo.ByLineInfo.Brand.DisplayValue
      }
      
      // Extract cover image (try large first, then medium)
      let cover_url = null
      if (item.Images?.Primary?.Large?.URL) {
        cover_url = item.Images.Primary.Large.URL
      } else if (item.Images?.Primary?.Medium?.URL) {
        cover_url = item.Images.Primary.Medium.URL
      }
      
      console.log('Successfully fetched from Amazon PA-API:', { title, author, cover_url })
      
      return {
        title,
        author,
        cover_url
      }
    }
    
    console.log('No items found in Amazon PA-API response for ASIN:', asin)
    return null
    
  } catch (error) {
    console.error('Amazon PA-API error for ASIN', asin, ':', error)
    return null
  }
} 