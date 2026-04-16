import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { name, email, password, role, instituteId, userClass } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const validRoles = ['student', 'teacher', 'institution']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    if (role === 'student') {
      if (!instituteId || !userClass) {
        return NextResponse.json(
          { error: 'Institute and Class are required for students' },
          { status: 400 }
        )
      }
      const parsedClass = parseInt(userClass, 10)
      if (isNaN(parsedClass) || parsedClass < 4 || parsedClass > 9) {
        return NextResponse.json(
          { error: 'Class must be between 4 and 9' },
          { status: 400 }
        )
      }
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Check platform settings
    const [settings] = await sql`SELECT allow_registration, auto_approve_teachers FROM platform_settings WHERE id = 1`
    const allowRegistration = settings?.allow_registration !== 0
    const autoApproveTeachers = settings?.auto_approve_teachers !== 0

    if (!allowRegistration) {
      return NextResponse.json(
        { error: 'Registration is currently disabled by administrator' },
        { status: 403 }
      )
    }

    const passwordHash = await hash(password, 10)

    // Students are auto-approved
    // Teachers are auto-approved if the setting is ON, otherwise need admin approval
    // Institutions always need admin approval
    const isApproved = role === 'student' || (role === 'teacher' && autoApproveTeachers)
    
    let dbInstituteId = role === 'student' ? instituteId : null
    const dbClass = role === 'student' ? parseInt(userClass, 10) : null

    // If registering as an institution, create the institution record first
    if (role === 'institution') {
      const newInstitution = await sql`
        INSERT INTO institutions (name, email, status)
        VALUES (${name}, ${email}, 'pending')
        RETURNING id
      `
      if (newInstitution.length > 0) {
        dbInstituteId = newInstitution[0].id
      }
    }

    console.log("DEBUG: Registering User", { role, dbInstituteId, dbClass });
    const newUsers = await sql`
      INSERT INTO users (name, email, password_hash, role, is_approved, institution_id, class)
      VALUES (${name}, ${email}, ${passwordHash}, ${role}, ${isApproved}, ${dbInstituteId}, ${dbClass})
      RETURNING id, email, name, role, is_approved, institution_id, class
    `

    return NextResponse.json({
      message: isApproved
        ? 'Account created successfully!'
        : 'Account created! Awaiting admin approval.',
      user: {
        id: newUsers[0].id,
        email: newUsers[0].email,
        name: newUsers[0].name,
        role: newUsers[0].role,
      },
      requiresApproval: !isApproved,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
