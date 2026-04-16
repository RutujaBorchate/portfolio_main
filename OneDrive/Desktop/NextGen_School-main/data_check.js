const Database = require('better-sqlite3');
const db = new Database('app.db');

try {
  // Show student data
  const studs = db.prepare("SELECT id, name, class, role FROM users WHERE role = 'student'").all();
  process.stdout.write('STUDENTS: ' + JSON.stringify(studs) + '\n');

  // Show ALL courses columns
  const cols = db.prepare("PRAGMA table_info(courses)").all();
  process.stdout.write('COURSES COLS: ' + JSON.stringify(cols.map(c => c.name)) + '\n');

  // Show courses data
  const courses = db.prepare("SELECT id, title, class, class_group, status FROM courses").all();
  process.stdout.write('COURSES: ' + JSON.stringify(courses) + '\n');
} catch(e) {
  process.stdout.write('ERROR: ' + e.message + '\n');
}
