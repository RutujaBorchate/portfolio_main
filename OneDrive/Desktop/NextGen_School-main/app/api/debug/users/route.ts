import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { compare } from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all users
    const users = await sql`
      SELECT id, email, name, role, is_approved, password_hash FROM users
    `

    // Test password comparison for demo123
    const testResults = []
    for (const user of users) {
      const isMatch = await compare('demo123', user.password_hash)
      testResults.push({
        email: user.email,
        role: user.role,
        isApproved: user.is_approved,
        passwordMatches: isMatch,
        hashPreview: user.password_hash.substring(0, 20) + '...',
      })
    }

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users: testResults,
      message: 'If passwordMatches is false, reseed the users',
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Debug failed',
      },
      { status: 500 }
    )
  }
}
