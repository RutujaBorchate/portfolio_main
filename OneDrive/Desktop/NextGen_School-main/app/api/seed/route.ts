import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Seed demo users with properly hashed password 'demo123'
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

    const results = []
    for (const user of demoUsers) {
      try {
        // Hash the password properly
        const passwordHash = await hash(user.password, 10)

        const result = await sql`
          INSERT INTO users (email, name, password_hash, role, is_approved)
          VALUES (${user.email}, ${user.name}, ${passwordHash}, ${user.role}, true)
          ON CONFLICT (email) DO NOTHING
          RETURNING id, email, name, role
        `
        if (result.length > 0) {
          results.push(`✅ Created user: ${user.email} (${user.role})`)
        } else {
          results.push(`⚠️ User already exists: ${user.email}`)
        }
      } catch (userError) {
        results.push(`❌ Error creating ${user.email}: ${userError instanceof Error ? userError.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo users seeded successfully',
      results,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Seed failed',
      },
      { status: 500 }
    )
  }
}
