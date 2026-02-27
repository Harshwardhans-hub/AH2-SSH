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

## Step-by-Step Instructions

### 1. Access Supabase Dashboard
Go to: https://wwdidwkcqicvaithslfl.supabase.co

### 2. Open SQL Editor
- Click on "SQL Editor" in the left sidebar
- Click "New Query" button

### 3. Run the Migration SQL
- Open the file: `backend/supabase-migration.sql`
- Copy ALL contents of the file
- Paste into the SQL Editor
- Click "Run" button

### 4. Verify Migration
After running the SQL, verify the data:

```sql
-- Check profile table
SELECT COUNT(*) FROM profile;

-- Check jobs table
SELECT COUNT(*) FROM jobs;

-- Check events table
SELECT COUNT(*) FROM events;

-- Check all tables
SELECT 
  schemaname,
  tablename,
  (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
FROM (
  SELECT 
    schemaname, 
    tablename, 
    query_to_xml(format('SELECT COUNT(*) AS cnt FROM %I.%I', schemaname, tablename), false, true, '') as xml_count
  FROM pg_tables
  WHERE schemaname = 'public'
) t
ORDER BY row_count DESC;
```

### 5. Update Environment Variables on Render

Make sure your Render deployment has the correct database credentials:

**Environment Variable:**
- The code now uses explicit connection parameters (no need for SUPABASE_URL env var)
- Or if you want to keep it: `SUPABASE_URL=postgresql://postgres:Har20050927Haha@db.wwdidwkcqicvaithslfl.supabase.co:5432/postgres`

### 6. Redeploy on Render

After migration is complete:
1. Push the latest code to GitHub (already done)
2. Render will auto-deploy
3. Check logs to verify connection

## Troubleshooting

### If migration fails:
1. Check if tables already exist with data
2. You can clear tables first:
   ```sql
   TRUNCATE TABLE drive_applications, internships, offer_letters, 
   company_drives, student_placements, notifications, placement_events, 
   student_profiles, applications, documents, companies, caf_forms, 
   events, jobs, community_posts, community_members, communities, profile 
   CASCADE;
   ```

### If connection fails on Render:
- The server.js has been updated with IPv4 enforcement
- Tables are created automatically on startup
- Check Render logs for specific errors

## Files Generated
- `backend/supabase-migration.sql` - Complete SQL dump (2,293 rows)
- `backend/export-sqlite-to-sql.js` - Script to regenerate SQL dump
- `backend/migrate-to-supabase.js` - Direct migration script (if network allows)

## Notes
- The migration uses `ON CONFLICT DO NOTHING` to prevent duplicate entries
- All passwords are already hashed with bcrypt
- Foreign key constraints are respected in the migration order
