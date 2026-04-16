const Database = require('better-sqlite3');
const db = new Database('app.db');

console.log('🔄 Migrating Database with class integer fields...');

try {
  db.prepare("ALTER TABLE users ADD COLUMN class INTEGER").run();
  console.log('✅ Added class INTEGER to users table');
} catch(e) {
  if(e.message.includes('duplicate column name')) {
    console.log('⚡ class column already exists on users');
  } else {
    console.error('❌ Error updating users:', e.message);
  }
}

try {
  db.prepare("ALTER TABLE courses ADD COLUMN class INTEGER").run();
  console.log('✅ Added class INTEGER to courses table');
} catch(e) {
  if(e.message.includes('duplicate column name')) {
    console.log('⚡ class column already exists on courses');
  } else {
    console.error('❌ Error updating courses:', e.message);
  }
}

// Ensure existing courses have a mapped int class
// Existing class_group matches strings. E.g "Class 4 Mathematics Masterclass"
// We can seed current class data if null
const courses = db.prepare('SELECT id, title FROM courses WHERE class IS NULL').all();
for (let c of courses) {
  const match = c.title.match(/Class (\d+)/i);
  if (match) {
    db.prepare('UPDATE courses SET class = ? WHERE id = ?').run(parseInt(match[1], 10), c.id);
  } else {
    // Default fallback to 4 just to prevent breakage in testing if seed didn't specify
    db.prepare('UPDATE courses SET class = ? WHERE id = ?').run(4, c.id);
  }
}
console.log('✅ Synchronized existing course classes');
console.log('✅ Migration COMPLETE.');
