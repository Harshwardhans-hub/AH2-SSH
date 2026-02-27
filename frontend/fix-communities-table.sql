-- Fix communities table to add missing columns
-- Run this in pgAdmin or PostgreSQL

-- Add created_by column if it doesn't exist
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS created_by INT REFERENCES profile(id);

-- Add created_at column if it doesn't exist
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'communities'
ORDER BY ordinal_position;
