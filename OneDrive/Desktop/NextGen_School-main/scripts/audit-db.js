const Database = require('better-sqlite3');
const db = new Database('app.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("--- DATABASE SCHEMA AUDIT ---");

for (const table of tables) {
    console.log(`\nTable: ${table.name}`);
    const info = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.table(info.map(c => ({ name: c.name, type: c.type, dflt: c.dflt_value })));
}

db.close();
