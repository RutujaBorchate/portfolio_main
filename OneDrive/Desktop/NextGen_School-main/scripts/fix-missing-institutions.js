const Database = require('better-sqlite3');
const db = new Database('app.db');

console.log('🔄 Starting data fix for institutions...');

// 1. Find institution users without a linked institution_id
const users = db.prepare("SELECT * FROM users WHERE role = 'institution' AND institution_id IS NULL").all();

console.log(`🔍 Found ${users.length} institution users requiring linkage.`);

for (const user of users) {
  try {
    // 2. Check if an institution with this email already exists
    let institution = db.prepare("SELECT id FROM institutions WHERE email = ?").get(user.email);
    
    let institutionId;
    
    if (!institution) {
      // 3. Create missing institution record
      // Map user is_approved boolean to institution status string
      const status = user.is_approved ? 'approved' : 'pending';
      
      const result = db.prepare(`
        INSERT INTO institutions (name, email, status)
        VALUES (?, ?, ?)
      `).run(user.name, user.email, status);
      
      institutionId = result.lastInsertRowid;
      console.log(`✅ Created institution profile for: ${user.name} (${status})`);
    } else {
      institutionId = institution.id;
      console.log(`ℹ️ Found existing institution profile for: ${user.name}`);
    }

    // 4. Link the user to the institution
    db.prepare("UPDATE users SET institution_id = ? WHERE id = ?").run(institutionId, user.id);
    console.log(`🔗 Linked user ${user.id} to institution ${institutionId}`);

  } catch (error) {
    console.error(`❌ Error fixing user ${user.id}:`, error.message);
  }
}

console.log('✅ Data fix COMPLETE.');
