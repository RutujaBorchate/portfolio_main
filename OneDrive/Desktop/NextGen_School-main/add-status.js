const Database = require('better-sqlite3');
const db = new Database('app.db');
try {
  db.prepare("ALTER TABLE institutions ADD COLUMN status VARCHAR(50) DEFAULT 'pending'").run();
  console.log('added status to institutions');
} catch(e) {
  if(e.message.includes('duplicate column name')) {
    console.log('status column already exists on institutions');
  } else {
    throw e;
  }
}
