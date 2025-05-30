import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AMAZON PA-API DEBUG ===')
    
    // Check environment variables
    const hasAccessKey = !!process.env.AMAZON_ACCESS_KEY
    const hasSecretKey = !!process.env.AMAZON_SECRET_KEY
    const hasPartnerTag = !!process.env.AMAZON_PARTNER_TAG
    
    console.log('Environment check:', {
      hasAccessKey,
      hasSecretKey,
      hasPartnerTag,
      accessKeyLength: process.env.AMAZON_ACCESS_KEY?.length || 0,
      secretKeyLength: process.env.AMAZON_SECRET_KEY?.length || 0,
      partnerTag: process.env.AMAZON_PARTNER_TAG
    })

    if (!hasAccessKey || !hasSecretKey || !hasPartnerTag) {
      return NextResponse.json({
        error: 'Missing credentials',
        hasAccessKey,
        hasSecretKey,
        hasPartnerTag
      })
    }

    // Try to import and use the PA-API
    const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk')
    
    // Initialize the API client
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    // Create a simple test request
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
    getItemsRequest.partnerTag = process.env.AMAZON_PARTNER_TAG
    getItemsRequest.partnerType = ProductAdvertisingAPIv1.PartnerType.Associates
    getItemsRequest.marketplace = 'www.amazon.com'
    getItemsRequest.itemIds = ['B0BVJB617Z'] // Test ASIN
    getItemsRequest.itemIdType = ProductAdvertisingAPIv1.ItemIdType.ASIN
    getItemsRequest.resources = [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo'
    ]

    console.log('Making test PA-API request...')

    const response = await new Promise((resolve, reject) => {
      api.getItems(getItemsRequest, (error: any, data: any) => {
        if (error) {
          console.error('PA-API Error Details:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            response: error.response?.data || error.response,
            stack: error.stack
          })
          resolve({ error: error })
        } else {
          console.log('PA-API Success:', data)
          resolve({ success: data })
        }
      })
    })

    return NextResponse.json({
      credentials: {
        hasAccessKey,
        hasSecretKey,
        hasPartnerTag,
        accessKeyLength: process.env.AMAZON_ACCESS_KEY?.length || 0,
        secretKeyLength: process.env.AMAZON_SECRET_KEY?.length || 0,
        partnerTag: process.env.AMAZON_PARTNER_TAG
      },
      apiResponse: response
    })

  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
} 