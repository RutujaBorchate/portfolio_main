import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Demo institutions
    const institutions = [
      {
        name: 'Harvard Academy',
        email: 'harvard@institution.com',
        logo: '🏛️',
      },
      {
        name: 'Stanford School',
        email: 'stanford@institution.com',
        logo: '🎓',
      },
      {
        name: 'Oxford Institute',
        email: 'oxford@institution.com',
        logo: '📚',
      },
    ]

    const results = []

    // Clear existing institutions and related data
    try {
      await sql`DELETE FROM users WHERE role = 'institution'`
      await sql`DELETE FROM institutions`
      results.push('✅ Cleared existing institutions')
    } catch (delError) {
      results.push(`⚠️ Error clearing institutions: ${delError instanceof Error ? delError.message : 'Unknown'}`)
    }

    // Create institutions
    const passwordHash = await hash('demo123', 10)
    for (const institution of institutions) {
      try {
        const result = await sql`
          INSERT INTO institutions (name, email, logo_url)
          VALUES (${institution.name}, ${institution.email}, ${institution.logo})
          RETURNING id, name, email
        `

        if (result.length > 0) {
          const instId = result[0].id

          // Create institution user account
          await sql`
            INSERT INTO users (email, name, password_hash, role, is_approved, institution_id)
            VALUES (
              ${institution.email},
              ${institution.name},
              ${passwordHash},
              'institution',
              true,
              ${instId}
            )
          `

          results.push(`✅ Created institution: ${institution.name} (${institution.email})`)
        }
      } catch (instError) {
        results.push(`❌ Error creating ${institution.name}: ${instError instanceof Error ? instError.message : 'Unknown'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo institutions seeded successfully',
      results,
      instructions: 'Use these credentials to login as an institution: email: harvard@institution.com or stanford@institution.com, password: demo123',
    })
  } catch (error) {
    console.error('Demo data error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to seed demo data',
      },
      { status: 500 }
    )
  }
}
