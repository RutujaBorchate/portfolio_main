const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('app.db');
const tables = db.prepare('PRAGMA table_info(users)').all();
fs.writeFileSync('output.json', JSON.stringify(tables, null, 2), 'utf8');
