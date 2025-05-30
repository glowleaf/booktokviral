import { DefaultApi, GetItemsRequest, GetItemsResource, PartnerType, Marketplace } from 'paapi5-nodejs-sdk'

interface BookDetails {
  title: string | null
  author: string | null
  cover_url: string | null
  asin: string
}

export class AmazonAPI {
  private api: DefaultApi
  private partnerTag: string

  constructor() {
    const accessKey = process.env.AMAZON_ACCESS_KEY_ID
    const secretKey = process.env.AMAZON_SECRET_ACCESS_KEY
    this.partnerTag = process.env.AMAZON_ASSOCIATE_TAG || 'booktokviral-20'

    if (!accessKey || !secretKey) {
      throw new Error('Amazon API credentials not configured')
    }

    this.api = new DefaultApi()
    this.api.host = 'webservices.amazon.com'
    this.api.region = 'us-east-1'
    this.api.accessKey = accessKey
    this.api.secretKey = secretKey
  }

  async getBookDetails(asin: string): Promise<BookDetails> {
    try {
      const getItemsRequest: GetItemsRequest = {
        PartnerTag: this.partnerTag,
        PartnerType: PartnerType.Associates,
        Marketplace: Marketplace.UnitedStates,
        ItemIds: [asin],
        Resources: [
          GetItemsResource.ItemInfoTitle,
          GetItemsResource.ItemInfoByLineInfo,
          GetItemsResource.ImagesLargePrimary,
          GetItemsResource.ImagesMediumPrimary,
          GetItemsResource.ImagesSmallPrimary
        ]
      }

      const response = await this.api.getItems(getItemsRequest)
      
      if (!response.ItemsResult?.Items || response.ItemsResult.Items.length === 0) {
        throw new Error('No item found for ASIN: ' + asin)
      }

      const item = response.ItemsResult.Items[0]
      
      // Extract book details
      const title = item.ItemInfo?.Title?.DisplayValue || null
      const author = item.ItemInfo?.ByLineInfo?.Contributors?.[0]?.Name || null
      
      // Get the best available image
      let cover_url = null
      if (item.Images?.Primary?.Large?.URL) {
        cover_url = item.Images.Primary.Large.URL
      } else if (item.Images?.Primary?.Medium?.URL) {
        cover_url = item.Images.Primary.Medium.URL
      } else if (item.Images?.Primary?.Small?.URL) {
        cover_url = item.Images.Primary.Small.URL
      }

      return {
        title,
        author,
        cover_url,
        asin
      }
    } catch (error) {
      console.error('Error fetching book details from Amazon API:', error)
      throw new Error(`Failed to fetch book details: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Singleton instance
let amazonAPI: AmazonAPI | null = null

export function getAmazonAPI(): AmazonAPI {
  if (!amazonAPI) {
    try {
      amazonAPI = new AmazonAPI()
    } catch (error) {
      console.error('Failed to initialize Amazon API:', error)
      throw error
    }
  }
  return amazonAPI
}

export async function fetchBookDetails(asin: string): Promise<BookDetails> {
  const api = getAmazonAPI()
  return await api.getBookDetails(asin)
} 