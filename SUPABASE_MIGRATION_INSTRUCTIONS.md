# Supabase Database Migration Instructions

## Overview
This guide will help you migrate your SQLite database to Supabase PostgreSQL.

## Migration Summary
- **Total rows to migrate:** 2,293
- **Tables with data:**
  - profile: 4 rows
  - communities: 1 row
  - jobs: 2,265 rows
  - events: 18 rows
  - applications: 3 rows
  - student_profiles: 2 rows

## ⚠️ SQL Editor Size Limit Issue
The complete SQL file is too large for Supabase SQL Editor. Use one of these methods:

---

## METHOD 1: Use Split Migration Files (RECOMMENDED)

The migration has been split into 28 smaller files in `backend/migration-chunks/`

### Steps:
1. Go to https://wwdidwkcqicvaithslfl.supabase.co
2. Open **SQL Editor**
3. Run files **in order** (they are numbered):
   - `01-profile.sql` (4 rows)
   - `02-communities.sql` (1 row)
   - `03-jobs-part1.sql` through `25-jobs.sql` (2,265 rows total)
   - `26-events.sql` (18 rows)
   - `27-applications.sql` (3 rows)
   - `28-student_profiles.sql` (2 rows)

4. For each file:
   - Open the file in a text editor
   - Copy all contents
   - Paste into Supabase SQL Editor
   - Click **Run**
   - Wait for success message
   - Move to next file

### Tips:
- Start with `01-profile.sql` (must be first due to foreign keys)
- Jobs table is split into 23 parts (100 rows each)
- Each file has `BEGIN;` and `COMMIT;` for transaction safety
- If a file fails, you can re-run it (uses `ON CONFLICT DO NOTHING`)

---

## METHOD 2: Use Supabase CLI (Fastest)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref wwdidwkcqicvaithslfl

# Run migration chunks
cd backend/migration-chunks
for file in *.sql; do
  supabase db execute --file "$file"
done
```

---

## METHOD 3: Use psql Command Line

If you have PostgreSQL client installed:

```bash
cd backend

# Run all chunks automatically
node run-migration-chunks.js

# Or manually run each file:
psql "postgresql://postgres:Har20050927Haha@db.wwdidwkcqicvaithslfl.supabase.co:5432/postgres" -f migration-chunks/01-profile.sql
psql "postgresql://postgres:Har20050927Haha@db.wwdidwkcqicvaithslfl.supabase.co:5432/postgres" -f migration-chunks/02-communities.sql
# ... continue for all files
```

---

## METHOD 4: Deploy and Let Server Populate

Since your server.js creates tables and syncs jobs/events automatically:

1. **Deploy to Render** (already done)
2. **Wait for automatic sync:**
   - Jobs sync runs every 30 minutes
   - Events sync runs every 30 minutes
   - Initial sync runs 5 seconds after startup

3. **Manually add users:**
   - Users must register through the app
   - Or use the SQL Editor to add specific users:

```sql
-- Add a test user
INSERT INTO profile (name, email, password, role, college, pass_out_year, created_at)
VALUES (
  'Test Student',
  'test@example.com',
  '$2a$10$.9UW83ARwZ2vFAfL6bwa6eyrGpqsTtIU5MFaSrEHXofmGE867Ynt.',
  'student',
  'Demo University',
  2027,
  NOW()
) ON CONFLICT (email) DO NOTHING;
```

---

## Verify Migration

After running migration, verify in Supabase SQL Editor:

```sql
-- Check all table counts
SELECT 
  'profile' as table_name, COUNT(*) as rows FROM profile
UNION ALL
SELECT 'communities', COUNT(*) FROM communities
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'student_profiles', COUNT(*) FROM student_profiles;
```

Expected results:
- profile: 4
- communities: 1
- jobs: 2,265
- events: 18
- applications: 3
- student_profiles: 2

---

## Update Render Environment

Your server.js is already configured with:
```javascript
const pool = new Pool({
  user: 'postgres',
  password: 'Har20050927Haha',
  host: 'db.wwdidwkcqicvaithslfl.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});
```

No environment variables needed! Just push and deploy.

---

## Troubleshooting

### If migration fails:
```sql
-- Clear all data and start over
TRUNCATE TABLE drive_applications, internships, offer_letters, 
company_drives, student_placements, notifications, placement_events, 
student_profiles, applications, documents, companies, caf_forms, 
events, jobs, community_posts, community_members, communities, profile 
CASCADE;
```

### If connection fails on Render:
- Check Render logs for specific errors
- Verify Supabase database is active
- Ensure IPv4 DNS resolution is working (already added to server.js)

---

## Files Reference

- `backend/supabase-migration.sql` - Complete SQL (too large for editor)
- `backend/migration-chunks/*.sql` - Split files (28 files, 100 rows each)
- `backend/export-sqlite-to-sql.js` - Regenerate SQL dump
- `backend/split-migration.js` - Split large SQL into chunks
- `backend/migrate-to-supabase.js` - Direct migration (requires network access)
- `backend/run-migration-chunks.js` - Automated psql runner

---

## Recommended Approach

**For quickest migration:**
1. Use METHOD 1 (Split files in SQL Editor)
2. Start with files 01-05 to test
3. If working well, continue with remaining files
4. Verify with the SQL query above

**For production:**
- Use METHOD 2 (Supabase CLI) if available
- Or METHOD 4 (let server auto-populate jobs/events)
- Manually migrate only critical user data
