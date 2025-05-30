import { NextRequest, NextResponse } from 'next/server'

const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk')

export async function GET(request: NextRequest) {
  try {
    console.log('=== AMAZON PA-API DIAGNOSTIC TEST ===')
    
    // Check environment variables
    const hasAccessKey = !!process.env.AMAZON_ACCESS_KEY
    const hasSecretKey = !!process.env.AMAZON_SECRET_KEY
    const hasPartnerTag = !!process.env.AMAZON_PARTNER_TAG
    
    console.log('Environment check:', {
      AMAZON_ACCESS_KEY: hasAccessKey ? 'Present' : 'MISSING',
      AMAZON_SECRET_KEY: hasSecretKey ? 'Present' : 'MISSING', 
      AMAZON_PARTNER_TAG: hasPartnerTag ? 'Present' : 'MISSING',
      partnerTagValue: process.env.AMAZON_PARTNER_TAG
    })

    if (!hasAccessKey || !hasSecretKey || !hasPartnerTag) {
      return NextResponse.json({
        error: 'Missing credentials',
        details: {
          AMAZON_ACCESS_KEY: hasAccessKey,
          AMAZON_SECRET_KEY: hasSecretKey,
          AMAZON_PARTNER_TAG: hasPartnerTag
        }
      })
    }

    // Initialize API client
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY
    defaultClient.host = 'webservices.amazon.com'
    defaultClient.region = 'us-east-1'

    const api = new ProductAdvertisingAPIv1.DefaultApi()

    // Test with a well-known book ASIN
    const testAsin = 'B073FZLLYS' // Harry Potter book
    
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest()
    getItemsRequest.partnerTag = process.env.AMAZON_PARTNER_TAG
    getItemsRequest.partnerType = ProductAdvertisingAPIv1.PartnerType.Associates
    getItemsRequest.marketplace = 'www.amazon.com'
    getItemsRequest.itemIds = [testAsin]
    getItemsRequest.itemIdType = ProductAdvertisingAPIv1.ItemIdType.ASIN
    getItemsRequest.resources = [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo'
    ]

    console.log('Making test request with:', {
      partnerTag: getItemsRequest.partnerTag,
      marketplace: getItemsRequest.marketplace,
      itemIds: getItemsRequest.itemIds,
      resources: getItemsRequest.resources
    })

    const response = await new Promise((resolve, reject) => {
      api.getItems(getItemsRequest, (error: any, data: any) => {
        if (error) {
          console.error('PA-API Error Details:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            response: error.response?.data || error.response
          })
          resolve({ error: error, data: null })
        } else {
          console.log('PA-API Success:', data)
          resolve({ error: null, data: data })
        }
      })
    })

    const result = response as any

    if (result.error) {
      return NextResponse.json({
        status: 'PA-API Error',
        error: {
          message: result.error.message,
          code: result.error.code,
          statusCode: result.error.statusCode,
          response: result.error.response?.data || result.error.response
        },
        diagnosis: getDiagnosis(result.error)
      })
    }

    const data = result.data
    
    // Check for errors in response
    if (data.Errors && data.Errors.length > 0) {
      return NextResponse.json({
        status: 'PA-API Response Errors',
        errors: data.Errors,
        diagnosis: getDiagnosisFromErrors(data.Errors)
      })
    }

    // Check for successful response
    if (data.ItemsResult?.Items && data.ItemsResult.Items.length > 0) {
      const item = data.ItemsResult.Items[0]
      return NextResponse.json({
        status: 'SUCCESS',
        item: {
          asin: item.ASIN,
          title: item.ItemInfo?.Title?.DisplayValue,
          author: item.ItemInfo?.ByLineInfo?.Contributors?.[0]?.Name,
          coverUrl: item.Images?.Primary?.Large?.URL
        },
        fullResponse: data
      })
    }

    return NextResponse.json({
      status: 'No Items Returned',
      fullResponse: data
    })

  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      status: 'Test Endpoint Error',
      error: error.message,
      stack: error.stack
    })
  }
}

function getDiagnosis(error: any): string {
  if (error.statusCode === 403 || error.code === 'AccessDeniedException') {
    return 'CREDENTIALS ISSUE: Your Amazon PA-API credentials may be old AWS credentials that need migration. Visit Associates Central and migrate your credentials.'
  }
  
  if (error.statusCode === 429) {
    return 'RATE LIMITING: You are making too many requests. Wait and try again.'
  }
  
  if (error.code === 'AccessDeniedAwsUsers') {
    return 'OLD AWS CREDENTIALS: You must migrate from AWS credentials to new PA-API credentials in Associates Central.'
  }
  
  return 'UNKNOWN ERROR: Check your credentials and account setup in Associates Central.'
}

function getDiagnosisFromErrors(errors: any[]): string {
  for (const error of errors) {
    if (error.Code === 'AccessDeniedException' || error.Code === 'AccessDeniedAwsUsers') {
      return 'CREDENTIALS NEED MIGRATION: Visit Associates Central and migrate your credentials from AWS to PA-API.'
    }
    
    if (error.Code === 'NoResults') {
      return 'NO RESULTS: The ASIN was not found in Amazon catalog.'
    }
    
    if (error.Code === 'TooManyRequests') {
      return 'RATE LIMITED: You are making requests too quickly.'
    }
  }
  
  return 'UNKNOWN ERROR: Check the error codes and messages.'
} 