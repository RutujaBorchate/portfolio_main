import Database from 'better-sqlite3'
import { hash } from 'bcryptjs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'app.db')
const db = new Database(dbPath)

export async function initializeDatabase() {
  try {
    // Enable foreign keys
    db.pragma('foreign_keys = ON')

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        is_approved BOOLEAN DEFAULT false,
        institution_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create institutions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS institutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        city TEXT,
        state TEXT,
        country TEXT,
        address TEXT,
        is_approved BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Check if demo users exist
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?')
    const result = stmt.get('admin@nextgenschool.com') as any

    if (result.count === 0) {
      // Seed demo users
      const demoUsers = [
        {
          email: 'admin@nextgenschool.com',
          name: 'Admin User',
          password: 'demo123',
          role: 'admin',
        },
        {
          email: 'teacher@nextgenschool.com',
          name: 'Demo Teacher',
          password: 'demo123',
          role: 'teacher',
        },
        {
          email: 'student@nextgenschool.com',
          name: 'Demo Student',
          password: 'demo123',
          role: 'student',
        },
      ]

      const insertStmt = db.prepare(`
        INSERT INTO users (email, name, password_hash, role, is_approved)
        VALUES (?, ?, ?, ?, true)
      `)

      for (const user of demoUsers) {
        const passwordHash = await hash(user.password, 10)
        insertStmt.run(user.email, user.name, passwordHash, user.role)
      }

      console.log('✅ Demo users seeded successfully')
    } else {
      console.log('✅ Demo users already exist')
    }

    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  }
}
