const Database = require('better-sqlite3');
const db = new Database('app.db');

console.log('🔄 Starting migration: Renaming user_id to student_id...');

try {
  // 1. Enrollments Table
  // SQLite doesn't support RENAME COLUMN in older versions easily with all constraints preserved, 
  // but better-sqlite3 usually handles it if the version is recent enough. 
  // Let's try the direct approach first.
  db.prepare("ALTER TABLE enrollments RENAME COLUMN user_id TO student_id").run();
  console.log('✅ Renamed enrollments.user_id -> student_id');
} catch (e) {
  console.log('⚠️ Enrollments rename failed or already done:', e.message);
}

try {
  // 2. Assignment Submissions Table
  db.prepare("ALTER TABLE assignment_submissions RENAME COLUMN user_id TO student_id").run();
  console.log('✅ Renamed assignment_submissions.user_id -> student_id');
} catch (e) {
  console.log('⚠️ Assignment submissions rename failed or already done:', e.message);
}

try {
  // 3. Quiz Responses Table (for consistency)
  db.prepare("ALTER TABLE quiz_responses RENAME COLUMN user_id TO student_id").run();
  console.log('✅ Renamed quiz_responses.user_id -> student_id');
} catch (e) {
  console.log('⚠️ Quiz responses rename failed or already done:', e.message);
}

console.log('✅ Migration COMPLETE.');
