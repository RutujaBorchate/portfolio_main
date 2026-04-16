const Database = require('better-sqlite3');
const db = new Database('app.db');
const rows = db.prepare("SELECT * FROM users WHERE role = 'institution'").all();
console.log(JSON.stringify(rows, null, 2));
