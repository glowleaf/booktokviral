// Test ASIN extraction logic
function extractASINFromURL(input) {
  if (!input) return null
  
  // Direct ASIN pattern (10 uppercase alphanumeric)
  const directASIN = input.match(/^[A-Z0-9]{10}$/)
  if (directASIN) return directASIN[0]
  
  // Amazon URL patterns
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /\/ASIN\/([A-Z0-9]{10})/,
    /\/asin\/([A-Z0-9]{10})/
  ]
  
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

// Test cases
const testCases = [
  'B076YGKSBZ',
  'https://www.amazon.com/dp/B076YGKSBZ',
  'https://www.amazon.com/dp/B076YGKSBZ/ref=sr_1_1',
  'https://www.amazon.com/gp/product/B076YGKSBZ',
  'https://www.amazon.com/Secrets-Divine-Love-Journal-Spiritual/dp/B076YGKSBZ',
  'B0C4BTQJTZ',
  'https://www.amazon.com/Fourth-Wing-Empyrean-Rebecca-Yarros/dp/B0C4BTQJTZ'
]

console.log('Testing ASIN extraction:\n')
testCases.forEach(test => {
  const result = extractASINFromURL(test)
  console.log(`Input: ${test}`)
  console.log(`Extracted ASIN: ${result}`)
  console.log('---')
}) 