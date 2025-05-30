import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const testAsin = searchParams.get('asin') || 'B073FZLLYS'
    
    // Check credentials
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY || !process.env.AMAZON_PARTNER_TAG) {
      return NextResponse.json({
        success: false,
        error: 'Missing Amazon API credentials',
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