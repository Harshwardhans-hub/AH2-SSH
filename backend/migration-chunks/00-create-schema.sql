-- 00-create-schema.sql
-- Run this FIRST before any data migration
-- Creates all tables for the Alumni Placement System

BEGIN;

-- 1. Profile table (base table, no dependencies)
CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  college VARCHAR(100),
  pass_out_year INT,
  department VARCHAR(100),
  phone VARCHAR(20),
  password VARCHAR(255),
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Communities table
CREATE TABLE IF NOT EXISTS communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'General',
  password VARCHAR(255),
  cover_image VARCHAR(500),
  created_by INT REFERENCES profile(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Community Members table
CREATE TABLE IF NOT EXISTS community_members (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id),
  user_id INT REFERENCES profile(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(community_id, user_id)
);

-- 4. Community Posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id),
  user_id INT REFERENCES profile(id),
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'post',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Jobs table (no dependencies)
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title TEXT,
  company TEXT,
  location TEXT,
  salary TEXT,
  type TEXT,
  source TEXT,
  applylink TEXT UNIQUE,
  posteddate TEXT,
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Events table (no dependencies)
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT,
  organizer TEXT,
  date TEXT,
  enddate TEXT,
  description TEXT,
  link TEXT UNIQUE,
  location TEXT,
  type TEXT,
  source TEXT,
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. CAF Forms table
CREATE TABLE IF NOT EXISTS caf_forms (
  id SERIAL PRIMARY KEY,
  college_id INT REFERENCES profile(id),
  company_name VARCHAR(200) NOT NULL,
  company_email VARCHAR(100),
  company_phone VARCHAR(20),
  job_role VARCHAR(200),
  job_description TEXT,
  eligibility_criteria TEXT,
  salary_package VARCHAR(100),
  application_deadline DATE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Companies table (no dependencies)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  website VARCHAR(200),
  industry VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  uploaded_by INT REFERENCES profile(id),
  document_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Applications table
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES profile(id),
  company_name VARCHAR(200) NOT NULL,
  role VARCHAR(200) NOT NULL,
  applied_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'applied',
  location VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Student Profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES profile(id) UNIQUE,
  resume_uploaded BOOLEAN DEFAULT false,
  resume_url VARCHAR(500),
  skills TEXT,
  course VARCHAR(100),
  profile_completion INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Placement Events table
CREATE TABLE IF NOT EXISTS placement_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50),
  event_date DATE,
  event_time TIME,
  location VARCHAR(200),
  is_online BOOLEAN DEFAULT false,
  organizer_id INT REFERENCES profile(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES profile(id),
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Student Placements table
CREATE TABLE IF NOT EXISTS student_placements (
  id SERIAL PRIMARY KEY,
  student_id INT UNIQUE REFERENCES profile(id),
  cgpa DECIMAL(3,2),
  eligibility_status VARCHAR(50) DEFAULT 'Eligible',
  companies_applied INT DEFAULT 0,
  current_status VARCHAR(50) DEFAULT 'Not Applied',
  offer_count INT DEFAULT 0,
  package_offered DECIMAL(10,2),
  graduation_year INT,
  is_placed BOOLEAN DEFAULT false,
  placement_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Company Drives table
CREATE TABLE IF NOT EXISTS company_drives (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  job_role VARCHAR(200),
  package_offered DECIMAL(10,2),
  drive_date DATE,
  drive_mode VARCHAR(50) DEFAULT 'Online',
  eligibility_criteria TEXT,
  students_applied INT DEFAULT 0,
  students_shortlisted INT DEFAULT 0,
  students_selected INT DEFAULT 0,
  drive_status VARCHAR(50) DEFAULT 'Upcoming',
  college_id INT REFERENCES profile(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Offer Letters table
CREATE TABLE IF NOT EXISTS offer_letters (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES profile(id),
  company_name VARCHAR(200) NOT NULL,
  offer_type VARCHAR(50) DEFAULT 'Full-time',
  package_amount DECIMAL(10,2),
  file_url TEXT,
  verification_status VARCHAR(50) DEFAULT 'Pending',
  verified_by INT REFERENCES profile(id),
  verification_date TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Internships table
CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES profile(id),
  company_name VARCHAR(200) NOT NULL,
  stipend DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  has_ppo BOOLEAN DEFAULT false,
  ppo_converted BOOLEAN DEFAULT false,
  ppo_package DECIMAL(10,2),
  internship_status VARCHAR(50) DEFAULT 'Ongoing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Drive Applications table
CREATE TABLE IF NOT EXISTS drive_applications (
  id SERIAL PRIMARY KEY,
  drive_id INT REFERENCES company_drives(id),
  student_id INT REFERENCES profile(id),
  application_status VARCHAR(50) DEFAULT 'Applied',
  interview_date TIMESTAMP,
  is_selected BOOLEAN DEFAULT false,
  offer_package DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(drive_id, student_id)
);

COMMIT;

-- Schema creation complete!
-- Now you can run the data migration files (01-profile.sql, 02-communities.sql, etc.)
