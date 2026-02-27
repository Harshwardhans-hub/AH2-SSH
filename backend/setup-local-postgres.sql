-- Setup script for local PostgreSQL database
-- Run this to create the database and tables locally

-- Create database (run this as postgres superuser)
-- CREATE DATABASE alumni_db;

-- Connect to alumni_db and run the rest:
-- \c alumni_db

-- Then run the schema creation
-- You can use: psql -U postgres -d alumni_db -f setup-local-postgres.sql

-- Or just run the 00-create-schema.sql file:
-- psql -U postgres -d alumni_db -f 00-create-schema.sql

-- For Windows users with PostgreSQL installed:
-- 1. Open Command Prompt or PowerShell
-- 2. Navigate to backend folder
-- 3. Run: psql -U postgres
-- 4. Enter your postgres password
-- 5. Run: CREATE DATABASE alumni_db;
-- 6. Run: \c alumni_db
-- 7. Run: \i 00-create-schema.sql

-- The schema will be created automatically when you start the server
-- But you can also create it manually using 00-create-schema.sql
