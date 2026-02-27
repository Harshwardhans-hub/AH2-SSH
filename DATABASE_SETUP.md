# Database Setup Guide

This project uses PostgreSQL as the database. You can use either a local PostgreSQL instance or a cloud provider like Render PostgreSQL, Supabase, or Neon.

## Option 1: Local PostgreSQL (Development)

### Prerequisites
- PostgreSQL installed on your machine
- Download from: https://www.postgresql.org/download/

### Setup Steps

1. **Install PostgreSQL**
   - Windows: Download installer from postgresql.org
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**
   ```bash
   # Open PostgreSQL command line
   psql -U postgres
   
   # Create database
   CREATE DATABASE alumni_db;
   
   # Exit
   \q
   ```

3. **Update .env file**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/alumni_db
   ```

4. **Start the server**
   ```bash
   cd backend
   npm install
   node server.js
   ```
   
   The server will automatically create all tables on startup.

5. **Seed demo data (optional)**
   ```bash
   node seed-demo-data.js
   ```

---

## Option 2: Render PostgreSQL (Production - RECOMMENDED)

### Setup Steps

1. **Create PostgreSQL Database on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "PostgreSQL"
   - Name: `alumni-db`
   - Database: `alumni_db`
   - User: `alumni_user`
   - Region: Choose closest to you
   - Plan: Free tier
   - Click "Create Database"

2. **Get Connection String**
   - After creation, copy the "Internal Database URL"
   - Format: `postgresql://user:password@host:5432/database`

3. **Configure Render Web Service**
   - Go to your web service on Render
   - Navigate to "Environment" tab
   - Add environment variable:
     - Key: `DATABASE_URL`
     - Value: (paste the Internal Database URL)
   - Save changes

4. **Deploy**
   - Push to GitHub
   - Render will auto-deploy
   - Tables will be created automatically on first run

---

## Option 3: Supabase (Alternative Cloud)

### Setup Steps

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your database password

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" (Session mode)
   - Replace `[YOUR-PASSWORD]` with your actual password

3. **Run Schema Creation**
   - Go to SQL Editor in Supabase
   - Copy contents of `backend/00-create-schema.sql`
   - Paste and run

4. **Update Environment**
   - Local: Update `DATABASE_URL` in `.env`
   - Render: Add `DATABASE_URL` environment variable

---

## Option 4: Neon (Serverless PostgreSQL)

### Setup Steps

1. **Create Neon Project**
   - Go to https://neon.tech
   - Create new project
   - Copy connection string

2. **Configure**
   - Update `DATABASE_URL` in `.env` or Render environment
   - Deploy

---

## Database Schema

The application uses 18 tables:
- `profile` - User accounts (students, colleges, admins)
- `communities` - Community groups
- `community_members` - Community membership
- `community_posts` - Posts in communities
- `jobs` - Job listings (auto-synced)
- `events` - Events and hackathons (auto-synced)
- `applications` - Student job applications
- `student_profiles` - Extended student info
- `student_placements` - Placement tracking
- `company_drives` - Campus recruitment drives
- `offer_letters` - Offer letter verification
- `internships` - Internship records
- `drive_applications` - Drive application tracking
- `caf_forms` - Company Application Forms
- `companies` - Company directory
- `documents` - Document storage
- `placement_events` - Placement events
- `notifications` - User notifications

All tables are created automatically when the server starts.

---

## Migration from SQLite

If you have existing SQLite data:

1. **Export data**
   ```bash
   cd backend
   node export-sqlite-to-sql.js
   ```

2. **Import to PostgreSQL**
   ```bash
   # Local
   psql -U postgres -d alumni_db -f supabase-migration.sql
   
   # Or use migration chunks for large datasets
   psql -U postgres -d alumni_db -f migration-chunks/00-create-schema.sql
   psql -U postgres -d alumni_db -f migration-chunks/01-profile.sql
   # ... continue with other files
   ```

---

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `sudo service postgresql start`
- Check port 5432 is not blocked
- Verify credentials in DATABASE_URL

### Tables Not Created
- Check server logs for errors
- Manually run: `psql -U postgres -d alumni_db -f backend/00-create-schema.sql`

### SSL Required Error
- For cloud databases, ensure SSL is enabled in connection string
- The code automatically handles SSL for production

### Render Deployment Issues
- Ensure DATABASE_URL is set in Render environment
- Use "Internal Database URL" not "External"
- Check Render logs for specific errors

---

## Environment Variables for Render

Required environment variables:
```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_secret_key
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
COLLEGE_NAME=Your College Name
```

Optional:
```
HUGGINGFACE_API_KEY=your_api_key
```

---

## Backup and Restore

### Backup
```bash
pg_dump -U postgres alumni_db > backup.sql
```

### Restore
```bash
psql -U postgres -d alumni_db < backup.sql
```

---

## Production Checklist

- [ ] PostgreSQL database created
- [ ] DATABASE_URL environment variable set
- [ ] Tables created (automatic on first run)
- [ ] SSL enabled for cloud databases
- [ ] Backup strategy in place
- [ ] Connection pooling configured (automatic)
- [ ] Monitoring enabled (Render provides this)

---

## Support

For issues:
1. Check server logs
2. Verify DATABASE_URL format
3. Test connection: `psql "YOUR_DATABASE_URL"`
4. Ensure PostgreSQL version 12+
