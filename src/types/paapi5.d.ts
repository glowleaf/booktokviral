declare module 'paapi5-nodejs-sdk' {
  export class DefaultApi {
    host: string
    region: string
    accessKey: string
    secretKey: string
    getItems(request: GetItemsRequest): Promise<GetItemsResponse>
  }

  export interface GetItemsRequest {
    PartnerTag: string
    PartnerType: PartnerType
    Marketplace: Marketplace
    ItemIds: string[]
    Resources: GetItemsResource[]
  }

  export interface GetItemsResponse {
    ItemsResult?: {
      Items?: Item[]
    }
  }

  export interface Item {
    ItemInfo?: {
      Title?: {
        DisplayValue?: string
      }
      ByLineInfo?: {
        Contributors?: Array<{
          Name?: string
        }>
      }
    }
    Images?: {
      Primary?: {
        Large?: {
          URL?: string
        }
        Medium?: {
          URL?: string
        }
        Small?: {
          URL?: string
        }
      }
    }
  }

  export enum PartnerType {
    Associates = 'Associates'
  }

  export enum Marketplace {
    UnitedStates = 'www.amazon.com'
  }

  export enum GetItemsResource {
    ItemInfoTitle = 'ItemInfo.Title',
    ItemInfoByLineInfo = 'ItemInfo.ByLineInfo',
    ImagesLargePrimary = 'Images.Primary.Large',
    ImagesMediumPrimary = 'Images.Primary.Medium',
    ImagesSmallPrimary = 'Images.Primary.Small'
  }
} 