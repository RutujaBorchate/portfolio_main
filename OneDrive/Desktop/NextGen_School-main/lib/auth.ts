import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare, hashSync } from 'bcryptjs'
import { sql, db } from './db'
import type { UserRole } from './types'
import { authConfig } from './auth.config'

// Initialize database on first import
function initializeDatabase() {
  try {
    console.log("🗄️ Initializing database...")
    db.pragma('foreign_keys = ON')

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

    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?')
    const result = stmt.get('admin@nextgenschool.com') as any

    if (result.count === 0) {
      console.log("🌱 Seeding demo users...")
      const demoUsers = [
        { email: 'admin@nextgenschool.com', name: 'Admin User', password: 'demo123', role: 'admin' },
        { email: 'teacher@nextgenschool.com', name: 'Demo Teacher', password: 'demo123', role: 'teacher' },
        { email: 'student@nextgenschool.com', name: 'Demo Student', password: 'demo123', role: 'student' },
      ]

      const insertStmt = db.prepare(`
        INSERT INTO users (email, name, password_hash, role, is_approved)
        VALUES (?, ?, ?, ?, true)
      `)

      for (const user of demoUsers) {
        const passwordHash = hashSync(user.password, 10)
        insertStmt.run(user.email, user.name, passwordHash, user.role)
      }
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error)
  }
}

// Only initialize if we're not in the Edge runtime
if (process.env.NEXT_RUNTIME !== 'edge') {
  initializeDatabase()
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        loginType: { label: 'Login Type', type: 'text' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const users = await sql`
            SELECT id, email, name, password_hash, role, is_approved, institution_id, class
            FROM users
            WHERE email = ${credentials.email as string}
          ` as any[]

          const user = users[0]
          if (!user) return null

          // Strict role check for admin login
          if (credentials.loginType === "admin") {
            if (user.role !== "admin") return null
          }

          const isValid = await compare(credentials.password as string, user.password_hash)
          if (!isValid) return null

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            isApproved: user.is_approved === 1 || user.is_approved === true,
            institutionId: user.institution_id ? String(user.institution_id) : undefined,
            class: user.class ? Number(user.class) : undefined,
          }
        } catch (error) {
          console.error("❌ Auth error:", error)
          return null
        }
      },
    }),
  ],
})
