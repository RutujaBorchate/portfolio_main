import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if database is connected
    const testQuery = await sql`SELECT 1 as test`
    
    if (!testQuery || testQuery.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Database connection test failed',
        dbConnected: false,
      })
    }

    // Get all users from database
    const allUsers = await sql`SELECT id, email, name, role, is_approved FROM users`

    return NextResponse.json({
      success: true,
      dbConnected: true,
      totalUsers: allUsers.length,
      users: allUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        isApproved: u.is_approved,
      })),
      instructions: {
        step1: 'If no users appear above, go to /setup and click "Reset & Reseed Demo Users"',
        step2: 'After seeding, come back here to verify users were created',
        step3: 'Then try logging in with admin@nextgenschool.com / demo123',
      }
    })
  } catch (error) {
    console.error('Check users error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check users',
        dbConnected: false,
      },
      { status: 500 }
    )
  }
}
