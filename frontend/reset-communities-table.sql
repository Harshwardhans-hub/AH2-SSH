-- Reset Communities Table
-- Run this in pgAdmin or PostgreSQL to completely recreate the communities table

-- Drop all related tables (this will delete all community data!)
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

-- Recreate communities table with correct schema
CREATE TABLE communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'General',
  password VARCHAR(255) NOT NULL,
  cover_image VARCHAR(500),
  created_by INT REFERENCES profile(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate community_members table
CREATE TABLE community_members (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  user_id INT REFERENCES profile(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(community_id, user_id)
);

-- Recreate community_posts table
CREATE TABLE community_posts (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  user_id INT REFERENCES profile(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'post',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('communities', 'community_members', 'community_posts');

-- Check communities columns
SELECT column_name, data_type, character_maximum_length, column_default
FROM information_schema.columns 
WHERE table_name = 'communities'
ORDER BY ordinal_position;
