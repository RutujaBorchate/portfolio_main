const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'app.db');
const db = new Database(dbPath);

console.log('🛠️ Updating schema for platform settings...');

try {
  db.transaction(() => {
    // 1. Create platform_settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        allow_registration BOOLEAN DEFAULT 1,
        auto_approve_teachers BOOLEAN DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Seed initial settings if missing
    const existing = db.prepare('SELECT id FROM platform_settings WHERE id = 1').get();
    if (!existing) {
      db.prepare('INSERT INTO platform_settings (id, allow_registration, auto_approve_teachers) VALUES (1, 1, 0)').run();
      console.log('✅ Initial settings row created.');
    } else {
      console.log('✅ Settings already exist.');
    }
  })();

  console.log('✅ Database schema updated successfully.');
} catch (error) {
  console.error('❌ Schema update error:', error.message);
} finally {
  db.close();
}
