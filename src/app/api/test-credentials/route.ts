import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if credentials exist
    const hasAccessKey = !!process.env.AMAZON_ACCESS_KEY
    const hasSecretKey = !!process.env.AMAZON_SECRET_KEY
    const hasPartnerTag = !!process.env.AMAZON_PARTNER_TAG
    
    console.log('Credential check:', {
      hasAccessKey,
      hasSecretKey,
      hasPartnerTag,
      accessKeyLength: process.env.AMAZON_ACCESS_KEY?.length || 0,
      secretKeyLength: process.env.AMAZON_SECRET_KEY?.length || 0,
      partnerTag: process.env.AMAZON_PARTNER_TAG
    })

    if (!hasAccessKey || !hasSecretKey || !hasPartnerTag) {
      return NextResponse.json({
        status: 'MISSING_CREDENTIALS',
        hasAccessKey,
        hasSecretKey,
        hasPartnerTag,
        message: 'Some Amazon API credentials are missing'
      })
    }

    // Try a simple PA-API call
    const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk')
    
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
    getItemsRequest.partnerTag = process.env.AMAZON_PARTNER_TAG
    getItemsRequest.partnerType = ProductAdvertisingAPIv1.PartnerType.Associates
    getItemsRequest.marketplace = 'www.amazon.com'
    getItemsRequest.itemIds = ['B0BVJB617Z'] // Test ASIN
    getItemsRequest.itemIdType = ProductAdvertisingAPIv1.ItemIdType.ASIN
    getItemsRequest.resources = ['ItemInfo.Title']

    const response = await new Promise((resolve, reject) => {
      api.getItems(getItemsRequest, (error: any, data: any) => {
        if (error) {
          console.error('PA-API Test Error:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            response: error.response
          })
          resolve({ error: error })
        } else {
          console.log('PA-API Test Success:', data)
          resolve({ data: data })
        }
      })
    })

    return NextResponse.json({
      status: 'CREDENTIALS_TESTED',
      hasCredentials: true,
      testResult: response
    })

  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      status: 'TEST_ERROR',
      error: error.message
    })
  }
} 