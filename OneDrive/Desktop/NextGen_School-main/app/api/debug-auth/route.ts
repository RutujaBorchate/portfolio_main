import { NextResponse } from 'next/server'
import { hash, compare } from 'bcryptjs'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test password hashing
    const testPassword = 'demo123'
    const hashedPassword = await hash(testPassword, 10)

    // Try to find admin user
    const adminUser = await sql`
      SELECT id, email, password_hash FROM users WHERE email = 'admin@nextgenschool.com'
    `

    let passwordMatches = false
    let testWithHashedPassword = false

    if (adminUser.length > 0) {
      // Test if provided password matches stored hash
      passwordMatches = await compare(testPassword, adminUser[0].password_hash)
      
      // Test if the newly generated hash would match
      testWithHashedPassword = await compare(testPassword, hashedPassword)
    }

    return NextResponse.json({
      success: true,
      testPassword: 'demo123',
      adminUserExists: adminUser.length > 0,
      adminUserEmail: adminUser.length > 0 ? adminUser[0].email : null,
      storedHashPreview: adminUser.length > 0 ? adminUser[0].password_hash.substring(0, 30) + '...' : null,
      newlyGeneratedHashPreview: hashedPassword.substring(0, 30) + '...',
      passwordMatchesStoredHash: passwordMatches,
      testNewHashWithPassword: testWithHashedPassword,
      analysis: {
        hasAdminUser: adminUser.length > 0,
        passwordHashValid: passwordMatches,
        issueIfFalse: 'The password hash in database is incorrect. Go to /setup and click "Reset & Reseed Demo Users"',
      }
    })
  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Debug failed',
      },
      { status: 500 }
    )
  }
}
