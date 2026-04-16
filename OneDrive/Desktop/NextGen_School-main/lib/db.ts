import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'app.db')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create a wrapper function that mimics the neon API
export const sql = async (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  const query = strings.join('?')
  try {
    const stmt = db.prepare(query)
    
    // SQLite doesn't natively support booleans, map to 1/0
    const mappedValues = values.map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v)
    
    // Determine if this is a SELECT, INSERT, UPDATE, or DELETE
    const trimmedQuery = query.trim().toUpperCase()
    
    // If it's a SELECT or has a RETURNING clause, we expect rows back
    if (trimmedQuery.startsWith('SELECT') || trimmedQuery.includes('RETURNING')) {
      return stmt.all(...mappedValues)
    } else if (trimmedQuery.startsWith('INSERT') || trimmedQuery.startsWith('UPDATE') || trimmedQuery.startsWith('DELETE')) {
      return stmt.run(...mappedValues) as any
    } else {
      return stmt.all(...mappedValues)
    }
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export type SqlQuery = typeof sql

export { db }
