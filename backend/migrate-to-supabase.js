// migrate-to-supabase.js - Migrate SQLite data to Supabase PostgreSQL

// Force IPv4 DNS resolution
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';

const sqlite3 = require("sqlite3").verbose();
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

// SQLite connection
const sqliteDbPath = path.join(__dirname, "alumni_db.sqlite");
const sqliteDb = new sqlite3.Database(sqliteDbPath);

// PostgreSQL connection (Supabase) - Using connection string for better compatibility
const pgPool = new Pool({
  connectionString: 'postgresql://postgres:Har20050927Haha@db.wwdidwkcqicvaithslfl.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 5,
});

// Helper functions
const sqliteQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function migrateTable(tableName, columns, idColumn = 'id') {
  try {
    console.log(`\n📦 Migrating table: ${tableName}`);
    
    // Fetch all data from SQLite
    const rows = await sqliteQuery(`SELECT * FROM ${tableName}`);
    
    if (rows.length === 0) {
      console.log(`   ⚠️  No data found in ${tableName}`);
      return;
    }

    console.log(`   Found ${rows.length} rows`);

    // Insert into PostgreSQL
    let successCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      try {
        const columnNames = Object.keys(row).filter(col => col !== idColumn);
        const values = columnNames.map(col => row[col]);
        const placeholders = columnNames.map((_, i) => `$${i + 1}`).join(', ');
        
        const insertQuery = `
          INSERT INTO ${tableName} (${columnNames.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `;

        await pgPool.query(insertQuery, values);
        successCount++;
      } catch (err) {
        errorCount++;
        console.log(`   ❌ Error inserting row ${row[idColumn]}: ${err.message}`);
      }
    }

    console.log(`   ✅ Migrated ${successCount} rows (${errorCount} errors)`);
  } catch (err) {
    console.error(`   ❌ Error migrating ${tableName}:`, err.message);
  }
}

async function migrate() {
  try {
    console.log("🚀 Starting migration from SQLite to Supabase PostgreSQL...\n");

    // Test PostgreSQL connection
    await pgPool.query("SELECT NOW()");
    console.log("✅ Connected to Supabase PostgreSQL\n");

    // Migrate tables in order (respecting foreign key constraints)
    
    // 1. Profile (no dependencies)
    await migrateTable('profile', [
      'name', 'email', 'role', 'college', 'pass_out_year', 
      'department', 'phone', 'password', 'login_count', 'created_at'
    ]);

    // 2. Communities (depends on profile)
    await migrateTable('communities', [
      'name', 'description', 'category', 'password', 
      'cover_image', 'created_by', 'created_at'
    ]);

    // 3. Community Members (depends on communities and profile)
    await migrateTable('community_members', [
      'community_id', 'user_id', 'joined_at'
    ]);

    // 4. Community Posts (depends on communities and profile)
    await migrateTable('community_posts', [
      'community_id', 'user_id', 'content', 'post_type', 'created_at'
    ]);

    // 5. Jobs (no dependencies)
    await migrateTable('jobs', [
      'title', 'company', 'location', 'salary', 'type', 
      'source', 'applyLink', 'postedDate', 'createdAt'
    ]);

    // 6. Events (no dependencies)
    await migrateTable('events', [
      'title', 'organizer', 'date', 'endDate', 'description', 
      'link', 'location', 'type', 'source', 'createdAt'
    ]);

    // 7. CAF Forms (depends on profile)
    await migrateTable('caf_forms', [
      'college_id', 'company_name', 'company_email', 'company_phone',
      'job_role', 'job_description', 'eligibility_criteria',
      'salary_package', 'application_deadline', 'status', 'created_at'
    ]);

    // 8. Companies (no dependencies)
    await migrateTable('companies', [
      'name', 'email', 'phone', 'website', 'industry', 
      'description', 'created_at'
    ]);

    // 9. Documents (depends on profile)
    await migrateTable('documents', [
      'title', 'description', 'file_url', 'uploaded_by',
      'document_type', 'created_at'
    ]);

    // 10. Applications (depends on profile)
    await migrateTable('applications', [
      'student_id', 'company_name', 'role', 'applied_date',
      'status', 'location', 'created_at'
    ]);

    // 11. Student Profiles (depends on profile)
    await migrateTable('student_profiles', [
      'student_id', 'resume_uploaded', 'resume_url', 'skills',
      'course', 'profile_completion', 'created_at'
    ]);

    // 12. Placement Events (depends on profile)
    await migrateTable('placement_events', [
      'title', 'description', 'event_type', 'event_date',
      'event_time', 'location', 'is_online', 'organizer_id', 'created_at'
    ]);

    // 13. Notifications (depends on profile)
    await migrateTable('notifications', [
      'user_id', 'title', 'message', 'is_read', 'created_at'
    ]);

    // 14. Student Placements (depends on profile)
    await migrateTable('student_placements', [
      'student_id', 'cgpa', 'eligibility_status', 'companies_applied',
      'current_status', 'offer_count', 'package_offered', 'graduation_year',
      'is_placed', 'placement_date', 'created_at', 'updated_at'
    ]);

    // 15. Company Drives (depends on profile)
    await migrateTable('company_drives', [
      'company_name', 'job_role', 'package_offered', 'drive_date',
      'drive_mode', 'eligibility_criteria', 'students_applied',
      'students_shortlisted', 'students_selected', 'drive_status',
      'college_id', 'created_at', 'updated_at'
    ]);

    // 16. Offer Letters (depends on profile)
    await migrateTable('offer_letters', [
      'student_id', 'company_name', 'offer_type', 'package_amount',
      'file_url', 'verification_status', 'verified_by',
      'verification_date', 'rejection_reason', 'created_at'
    ]);

    // 17. Internships (depends on profile)
    await migrateTable('internships', [
      'student_id', 'company_name', 'stipend', 'start_date',
      'end_date', 'has_ppo', 'ppo_converted', 'ppo_package',
      'internship_status', 'created_at'
    ]);

    // 18. Drive Applications (depends on company_drives and profile)
    await migrateTable('drive_applications', [
      'drive_id', 'student_id', 'application_status', 'interview_date',
      'is_selected', 'offer_package', 'created_at'
    ]);

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   All tables have been migrated to Supabase PostgreSQL");
    console.log("   Database URL: https://wwdidwkcqicvaithslfl.supabase.co");

  } catch (err) {
    console.error("\n❌ Migration failed:", err);
  } finally {
    sqliteDb.close();
    await pgPool.end();
    console.log("\n✅ Connections closed");
  }
}

// Run migration
migrate();
