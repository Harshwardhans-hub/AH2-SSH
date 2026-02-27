-- Community System Tables Setup
-- Run this in pgAdmin or PostgreSQL to ensure all community tables exist

-- Drop existing tables if you want to start fresh (OPTIONAL - UNCOMMENT IF NEEDED)
-- DROP TABLE IF EXISTS community_posts CASCADE;
-- DROP TABLE IF EXISTS community_members CASCADE;
-- DROP TABLE IF EXISTS communities CASCADE;

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'General',
  password VARCHAR(255) NOT NULL,
  cover_image TEXT,
  created_by INT REFERENCES profile(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS community_members (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  user_id INT REFERENCES profile(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(community_id, user_id)
);

-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  user_id INT REFERENCES profile(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'post',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('communities', 'community_members', 'community_posts');

-- Check community_posts columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'community_posts'
ORDER BY ordinal_position;
