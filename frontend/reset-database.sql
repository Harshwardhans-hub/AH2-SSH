-- Reset Database Script
-- Run this in pgAdmin on the "information" database to reset tables

-- Step 1: Drop existing tables
DROP TABLE IF EXISTS profile CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

-- Step 2: Restart your backend server after running this
-- The backend will automatically create the tables with the correct schema

-- To verify tables were created correctly after backend restart, run:
-- SELECT * FROM information_schema.columns WHERE table_name = 'profile';
