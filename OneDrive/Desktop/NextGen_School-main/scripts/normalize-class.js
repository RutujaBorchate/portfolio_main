/**
 * Normalizes the class column in courses table:
 * - Converts "Class 8" → 8 (integer)
 * - Both class and class_group columns
 */
const Database = require('better-sqlite3');
const db = new Database('app.db');

console.log('--- Before migration ---');
const before = db.prepare("SELECT id, title, class, class_group FROM courses").all();
console.log(JSON.stringify(before, null, 2));

// Update all courses: strip "Class " prefix and convert to integer
const courses = db.prepare("SELECT id, class, class_group FROM courses").all();

const updateStmt = db.prepare("UPDATE courses SET class = ?, class_group = ? WHERE id = ?");

let updated = 0;
for (const c of courses) {
  let classVal = c.class;
  let classGroup = c.class_group;

  // Normalize class: "Class 8" → 8, "8" → 8
  if (typeof classVal === 'string') {
    classVal = parseInt(classVal.replace(/[^0-9]/g, ''), 10);
    if (isNaN(classVal)) classVal = null;
  }
  if (typeof classGroup === 'string') {
    classGroup = parseInt(classGroup.replace(/[^0-9]/g, ''), 10);
    if (isNaN(classGroup)) classGroup = null;
  }

  updateStmt.run(classVal, classGroup, c.id);
  updated++;
}

console.log(`\n✅ Updated ${updated} courses`);

console.log('\n--- After migration ---');
const after = db.prepare("SELECT id, title, class, class_group FROM courses").all();
console.log(JSON.stringify(after, null, 2));

console.log('\n--- Students for verification ---');
const students = db.prepare("SELECT id, name, class, role FROM users WHERE role = 'student'").all();
console.log(JSON.stringify(students, null, 2));
