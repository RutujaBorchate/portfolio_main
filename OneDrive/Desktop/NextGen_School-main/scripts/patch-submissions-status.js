const Database = require('better-sqlite3');
const db = new Database('app.db');

console.log('🔄 Starting database patch...');

try {
  // 1. Add status column to assignment_submissions if it doesn't exist
  const info = db.prepare("PRAGMA table_info(assignment_submissions)").all();
  const hasStatus = info.some(c => c.name === 'status');
  
  if (!hasStatus) {
    db.prepare("ALTER TABLE assignment_submissions ADD COLUMN status VARCHAR(50) DEFAULT 'submitted'").run();
    console.log('✅ Added status column to assignment_submissions');
  } else {
    console.log('ℹ️ assignment_submissions already has status column');
  }
} catch (e) {
  console.error('❌ Error patching assignment_submissions:', e.message);
}

console.log('✅ Database patch COMPLETE.');
