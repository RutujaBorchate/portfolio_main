const Database = require('better-sqlite3');
const db = new Database('app.db');

console.log('🔄 Migrating courses table...');

try {
  // 1. Add institution_id column if it doesn't exist
  const info = db.prepare("PRAGMA table_info(courses)").all();
  const hasInstitutionId = info.some(c => c.name === 'institution_id');
  
  if (!hasInstitutionId) {
    db.prepare("ALTER TABLE courses ADD COLUMN institution_id INTEGER").run();
    console.log('✅ Added institution_id column to courses table.');
  } else {
    console.log('ℹ️ institution_id column already exists.');
  }

  // 2. Link existing courses to institution 12 (Vishwakarma Institute)
  // This is a one-time data patch to make them visible
  const updateResult = db.prepare("UPDATE courses SET institution_id = 12 WHERE institution_id IS NULL").run();
  console.log(`✅ Linked ${updateResult.changes} existing courses to institution 12.`);

} catch (e) {
  console.error('❌ Error migrating courses:', e.message);
}

console.log('✅ Migration COMPLETE.');
