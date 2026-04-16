const Database = require('better-sqlite3');
const db = new Database('app.db');
try {
  db.prepare('SELECT ? as val').get(true);
  console.log('Boolean bound successfully');
} catch (e) {
  console.error('Error binding boolean:', e.message);
}
