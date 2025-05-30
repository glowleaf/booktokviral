// Fallback book data for known ASINs
// This ensures books always show with proper titles and covers

export const BOOK_DATA_FALLBACK: Record<string, {title: string, author: string, cover_url: string}> = {
  'B076YGKSBZ': {
    title: 'The Secrets of Divine Love Journal: Insightful Reflections that Inspire Hope and Revive Faith',
    author: 'A. Helwa',
    cover_url: 'https://m.media-amazon.com/images/I/71YgNhN9TQL._SY466_.jpg'
  },
  'B0C4BTQJTZ': {
    title: 'Fourth Wing (The Empyrean Book 1)',
    author: 'Rebecca Yarros',
    cover_url: 'https://m.media-amazon.com/images/I/91n7p-j5aqL._SY466_.jpg'
  },
  'B098T8FD1S': {
    title: 'It Ends with Us: A Novel',
    author: 'Colleen Hoover',
    cover_url: 'https://m.media-amazon.com/images/I/81s0B6NYXML._SY466_.jpg'
  },
  'B08N5WRWNW': {
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    cover_url: 'https://m.media-amazon.com/images/I/81JJPDNlxSL._SY466_.jpg'
  },
  'B073FZLLYS': {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    cover_url: 'https://m.media-amazon.com/images/I/71-++hbbERL._SY466_.jpg'
  }
}

export function getFallbackBookData(asin: string) {
  return BOOK_DATA_FALLBACK[asin] || null
} 