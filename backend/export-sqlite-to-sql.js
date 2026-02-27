// export-sqlite-to-sql.js - Export SQLite data to PostgreSQL SQL file
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const sqliteDbPath = path.join(__dirname, "alumni_db.sqlite");
const sqliteDb = new sqlite3.Database(sqliteDbPath);
const outputFile = path.join(__dirname, "supabase-migration.sql");

const sqliteQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

function escapeString(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  if (typeof str === 'boolean') return str ? 'true' : 'false';
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function exportTable(tableName, stream) {
  try {
    console.log(`📦 Exporting table: ${tableName}`);
    
    const rows = await sqliteQuery(`SELECT * FROM ${tableName}`);
    
    if (rows.length === 0) {
      console.log(`   ⚠️  No data in ${tableName}`);
      return 0;
    }

    stream.write(`\n-- Migrating ${tableName} (${rows.length} rows)\n`);
    
    for (const row of rows) {
      const columns = Object.keys(row).filter(col => col !== 'id');
      // Convert column names to lowercase for PostgreSQL compatibility
      const lowerColumns = columns.map(col => col.toLowerCase());
      const values = columns.map(col => escapeString(row[col])).join(', ');
      
      stream.write(
        `INSERT INTO ${tableName} (${lowerColumns.join(', ')}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`
      );
    }

    console.log(`   ✅ Exported ${rows.length} rows`);
    return rows.length;
  } catch (err) {
    console.error(`   ❌ Error exporting ${tableName}:`, err.message);
    return 0;
  }
}

async function exportData() {
  try {
    console.log("🚀 Starting SQLite to PostgreSQL SQL export...\n");

    const stream = fs.createWriteStream(outputFile);
    
    stream.write("-- SQLite to PostgreSQL Migration SQL\n");
    stream.write("-- Generated: " + new Date().toISOString() + "\n");
    stream.write("-- Run this in Supabase SQL Editor\n\n");
    stream.write("BEGIN;\n\n");

    let totalRows = 0;

    // Export tables in order (respecting foreign key constraints)
    totalRows += await exportTable('profile', stream);
    totalRows += await exportTable('communities', stream);
    totalRows += await exportTable('community_members', stream);
    totalRows += await exportTable('community_posts', stream);
    totalRows += await exportTable('jobs', stream);
    totalRows += await exportTable('events', stream);
    totalRows += await exportTable('caf_forms', stream);
    totalRows += await exportTable('companies', stream);
    totalRows += await exportTable('documents', stream);
    totalRows += await exportTable('applications', stream);
    totalRows += await exportTable('student_profiles', stream);
    totalRows += await exportTable('placement_events', stream);
    totalRows += await exportTable('notifications', stream);
    totalRows += await exportTable('student_placements', stream);
    totalRows += await exportTable('company_drives', stream);
    totalRows += await exportTable('offer_letters', stream);
    totalRows += await exportTable('internships', stream);
    totalRows += await exportTable('drive_applications', stream);

    stream.write("\nCOMMIT;\n");
    stream.write("\n-- Migration complete!\n");
    stream.write(`-- Total rows exported: ${totalRows}\n`);
    
    stream.end();

    console.log("\n🎉 Export completed successfully!");
    console.log(`📄 SQL file created: ${outputFile}`);
    console.log(`📊 Total rows exported: ${totalRows}`);
    console.log("\n📝 Next steps:");
    console.log("1. Go to https://wwdidwkcqicvaithslfl.supabase.co");
    console.log("2. Open SQL Editor");
    console.log("3. Copy and paste the contents of supabase-migration.sql");
    console.log("4. Run the SQL script");

  } catch (err) {
    console.error("\n❌ Export failed:", err);
  } finally {
    sqliteDb.close();
  }
}

exportData();
