// run-migration-chunks.js - Run migration chunks via psql command
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const chunksDir = path.join(__dirname, 'migration-chunks');
const connectionString = 'postgresql://postgres:Har20050927Haha@db.wwdidwkcqicvaithslfl.supabase.co:5432/postgres';

console.log('🚀 Running migration chunks via psql...\n');

// Check if psql is available
try {
  execSync('psql --version', { stdio: 'ignore' });
} catch (err) {
  console.error('❌ psql command not found!');
  console.log('\n📝 Alternative options:');
  console.log('1. Install PostgreSQL client tools');
  console.log('2. Use Supabase SQL Editor (run files manually)');
  console.log('3. Use the migration-chunks files one by one\n');
  process.exit(1);
}

// Get all SQL files in order
const files = fs.readdirSync(chunksDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`Found ${files.length} migration chunks\n`);

let successCount = 0;
let errorCount = 0;

for (const file of files) {
  try {
    console.log(`📦 Running: ${file}...`);
    const filePath = path.join(chunksDir, file);
    
    execSync(`psql "${connectionString}" -f "${filePath}"`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log(`   ✅ Success\n`);
    successCount++;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
    errorCount++;
  }
}

console.log('\n🎉 Migration complete!');
console.log(`✅ Success: ${successCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
