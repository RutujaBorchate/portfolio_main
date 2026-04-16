const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('app.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
let output = "--- DATABASE SCHEMA AUDIT ---\n";

for (const table of tables) {
    output += `\nTable: ${table.name}\n`;
    const info = db.prepare(`PRAGMA table_info(${table.name})`).all();
    output += JSON.stringify(info, null, 2) + "\n";
}

fs.writeFileSync('audit_output.txt', output, 'utf8');
db.close();
console.log('✅ Audit written to audit_output.txt');
