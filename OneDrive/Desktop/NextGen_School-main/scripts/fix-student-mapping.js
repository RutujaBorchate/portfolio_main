const Database = require('better-sqlite3');
const db = new Database('app.db');

console.log('🔄 Fixing student-institution mapping...');

try {
  // Update students linked to Admin (1) or Teacher (2) to point to the correct Institution (12)
  const result = db.prepare(`
    UPDATE users 
    SET institution_id = 12 
    WHERE role = 'student' 
    AND (institution_id = 1 OR institution_id = 2 OR institution_id IS NULL)
  `).run();

  console.log(`✅ Updated ${result.changes} student records to point to institution 12.`);
} catch (e) {
  console.error('❌ Error updating database:', e.message);
}

console.log('✅ Mapping fix COMPLETE.');
