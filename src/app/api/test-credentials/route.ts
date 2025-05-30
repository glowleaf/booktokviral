import { NextRequest, NextResponse } from 'next/server'

// Dynamic SDK loading function using eval to prevent webpack analysis
async function loadAmazonSDK() {
  if (typeof window !== 'undefined') {
    return null
  }
  
  // Skip during build process
  if (process.env.NODE_ENV !== 'development' && !process.env.VERCEL_ENV) {
    return null
  }
  
  try {
    // Use eval to prevent webpack from analyzing this require
    const requireFunc = eval('require')
    const sdk = requireFunc('paapi5-nodejs-sdk')
    return sdk
  } catch (error) {
    console.log('[Test Credentials] SDK not available')
    return null
  }
}

export async function GET() {
  try {
    // Check environment variables
    const accessKey = process.env.AMAZON_ACCESS_KEY
    const secretKey = process.env.AMAZON_SECRET_KEY
    const partnerTag = process.env.AMAZON_PARTNER_TAG

    if (!accessKey || !secretKey || !partnerTag) {
      return NextResponse.json({
        success: false,
        error: 'Missing credentials',
        details: {
          hasAccessKey: !!accessKey,
          hasSecretKey: !!secretKey,
          hasPartnerTag: !!partnerTag
        }
      })
    }

    // Try to load SDK
    const ProductAdvertisingAPIv1 = await loadAmazonSDK()
    if (!ProductAdvertisingAPIv1) {
      return NextResponse.json({
        success: true,
        message: 'Credentials are configured (SDK not available in production)',
        credentials: {
          hasAccessKey: true,
          hasSecretKey: true,
          hasPartnerTag: true,
          partnerTag: partnerTag
        }
      })
    }

    // Test API connection with a simple request
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    defaultClient.accessKey = accessKey
    defaultClient.secretKey = secretKey
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    // Create a simple test request
    const testRequest: any = {}
    testRequest.PartnerTag = partnerTag
    testRequest.PartnerType = 'Associates'
    testRequest.Marketplace = 'www.amazon.com'
    testRequest.ItemIds = ['B073FZLLYS'] // Test with a known book ASIN
    testRequest.ItemIdType = 'ASIN'
    testRequest.Resources = ['ItemInfo.Title']

    const response = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout after 10 seconds'))
      }, 10000)

      api.getItems(testRequest, (error: any, data: any) => {
        clearTimeout(timeout)
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Credentials are valid and API is accessible',
      testResponse: response
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        code: error.code,
        statusCode: error.statusCode,
        responseBody: error.responseBody
      }
    })
  }
} 