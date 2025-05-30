-- Add category column to books table
ALTER TABLE books ADD COLUMN category TEXT;

-- Set default category for existing books
UPDATE books SET category = 'BookTok' WHERE category IS NULL;

-- Add index for better performance when filtering by category
CREATE INDEX idx_books_category ON books(category); 