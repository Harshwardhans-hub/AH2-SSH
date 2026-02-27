// split-migration.js - Split large SQL file into smaller chunks
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'supabase-migration.sql');
const outputDir = path.join(__dirname, 'migration-chunks');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

console.log('📦 Splitting migration SQL into smaller chunks...\n');

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

// Group by table
let currentChunk = [];
let chunkNumber = 1;
let currentTable = '';
let lineCount = 0;
const maxLinesPerChunk = 100; // Smaller chunks

currentChunk.push('BEGIN;\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Skip BEGIN and COMMIT from original file
  if (line.trim() === 'BEGIN;' || line.trim() === 'COMMIT;') {
    continue;
  }
  
  // Detect table changes
  if (line.includes('-- Migrating')) {
    const match = line.match(/-- Migrating (\w+)/);
    if (match && match[1] !== currentTable) {
      // Save previous chunk if it has content
      if (lineCount > 0) {
        currentChunk.push('\nCOMMIT;\n');
        const filename = path.join(outputDir, `${String(chunkNumber).padStart(2, '0')}-${currentTable}.sql`);
        fs.writeFileSync(filename, currentChunk.join('\n'));
        console.log(`✅ Created: ${String(chunkNumber).padStart(2, '0')}-${currentTable}.sql (${lineCount} inserts)`);
        chunkNumber++;
        currentChunk = ['BEGIN;\n'];
        lineCount = 0;
      }
      currentTable = match[1];
    }
  }
  
  currentChunk.push(line);
  
  if (line.trim().startsWith('INSERT INTO')) {
    lineCount++;
    
    // Split large tables into multiple chunks
    if (lineCount >= maxLinesPerChunk && (currentTable === 'jobs' || currentTable === 'events')) {
      currentChunk.push('\nCOMMIT;\n');
      const filename = path.join(outputDir, `${String(chunkNumber).padStart(2, '0')}-${currentTable}-part${Math.floor(lineCount / maxLinesPerChunk)}.sql`);
      fs.writeFileSync(filename, currentChunk.join('\n'));
      console.log(`✅ Created: ${String(chunkNumber).padStart(2, '0')}-${currentTable}-part${Math.floor(lineCount / maxLinesPerChunk)}.sql (${maxLinesPerChunk} inserts)`);
      chunkNumber++;
      currentChunk = ['BEGIN;\n', `\n-- Migrating ${currentTable} (continued)\n`];
      lineCount = 0;
    }
  }
}

// Save last chunk
if (currentChunk.length > 1) {
  currentChunk.push('\nCOMMIT;\n');
  const filename = path.join(outputDir, `${String(chunkNumber).padStart(2, '0')}-${currentTable}.sql`);
  fs.writeFileSync(filename, currentChunk.join('\n'));
  console.log(`✅ Created: ${String(chunkNumber).padStart(2, '0')}-${currentTable}.sql (${lineCount} inserts)`);
}

console.log(`\n🎉 Split complete! Created ${chunkNumber} SQL files in migration-chunks/`);
console.log('\n📝 Run these files in order in Supabase SQL Editor');
