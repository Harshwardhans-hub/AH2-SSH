-- Database Migration Script for Role-Based Authentication
-- Run this in pgAdmin or psql to update your existing database

-- Option 1: If you want to keep existing data, ALTER the table
ALTER TABLE profile 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student',
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have 'student' role if not set
UPDATE profile SET role = 'student' WHERE role IS NULL;

-- Option 2: If you want to start fresh, DROP and let the backend recreate
-- Uncomment the lines below if you want to start fresh (WARNING: This deletes all data!)
-- DROP TABLE IF EXISTS profile CASCADE;
-- DROP TABLE IF EXISTS communities CASCADE;
-- Then restart your backend server and it will create the tables with the new schema

-- Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'profile';
