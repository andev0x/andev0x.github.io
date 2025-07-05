-- Reset database table for PostgreSQL
-- WARNING: This will delete all existing data!

-- Drop the existing table
DROP TABLE IF EXISTS comments;

-- Create the table with proper PostgreSQL syntax
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify the table was created
SELECT * FROM comments LIMIT 0; 