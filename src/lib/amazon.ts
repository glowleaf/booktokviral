/**
 * Amazon Affiliate Link Utilities
 * Generates Amazon links with affiliate tag for monetization
 */

const AMAZON_AFFILIATE_TAG = 'booktokviral-20'

/**
 * Generate Amazon affiliate link for a given ASIN
 * @param asin - Amazon Standard Identification Number
 * @param linkType - Type of Amazon link (dp, gp, etc.)
 * @returns Complete Amazon URL with affiliate tag
 */
export function getAmazonAffiliateLink(asin: string, linkType: 'dp' | 'gp' = 'dp'): string {
  const baseUrl = `https://www.amazon.com/${linkType}/${asin}`
  const affiliateParams = new URLSearchParams({
    tag: AMAZON_AFFILIATE_TAG,
    linkCode: 'as2',
    camp: '1789',
    creative: '9325'
  })
  
  return `${baseUrl}?${affiliateParams.toString()}`
}

/**
 * Generate Amazon search affiliate link
 * @param searchTerm - Search term for Amazon
 * @returns Amazon search URL with affiliate tag
 */
export function getAmazonSearchLink(searchTerm: string): string {
  const baseUrl = 'https://www.amazon.com/s'
  const searchParams = new URLSearchParams({
    k: searchTerm,
    tag: AMAZON_AFFILIATE_TAG,
    linkCode: 'as2'
  })
  
  return `${baseUrl}?${searchParams.toString()}`
}

/**
 * Check if a URL is an Amazon link
 * @param url - URL to check
 * @returns boolean indicating if it's an Amazon link
 */
export function isAmazonLink(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes('amazon.com') || urlObj.hostname.includes('amzn.to')
  } catch {
    return false
  }
}

/**
 * Extract ASIN from Amazon URL
 * @param url - Amazon URL
 * @returns ASIN if found, null otherwise
 */
export function extractASINFromUrl(url: string): string | null {
  const asinPatterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /asin=([A-Z0-9]{10})/i
  ]
  
  for (const pattern of asinPatterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
} 