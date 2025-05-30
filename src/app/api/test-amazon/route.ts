import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const testAsin = searchParams.get('asin') || 'B073FZLLYS'
    
    // Check credentials
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY || !process.env.AMAZON_PARTNER_TAG) {
      return NextResponse.json({
        success: false,
        error: 'Missing credentials',
        asin: testAsin,
        credentials: {
          hasAccessKey: !!process.env.AMAZON_ACCESS_KEY,
          hasSecretKey: !!process.env.AMAZON_SECRET_KEY,
          hasPartnerTag: !!process.env.AMAZON_PARTNER_TAG
        }
      })
    }

    // For now, return mock success response
    // TODO: Re-implement actual Amazon API testing after deployment
    return NextResponse.json({
      success: true,
      asin: testAsin,
      message: 'Amazon API testing temporarily disabled for build',
      bookData: null,
      credentials: {
        hasAccessKey: true,
        hasSecretKey: true,
        hasPartnerTag: true
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      asin: request.nextUrl.searchParams.get('asin') || 'B073FZLLYS',
      error: error.message,
      timestamp: new Date().toISOString()
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