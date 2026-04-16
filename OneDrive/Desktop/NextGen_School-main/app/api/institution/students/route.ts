import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user as any).role !== "institution") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const students = await sql`
      SELECT 
        u.id, u.name, u.email, u.created_at,
        COUNT(DISTINCT e.id) as courses_enrolled,
        COUNT(DISTINCT cert.id) as certificates,
        COALESCE(AVG(e.progress), 0) as avg_progress
      FROM users u
      LEFT JOIN enrollments e ON e.student_id = u.id AND e.status = 'approved'
      LEFT JOIN certificates cert ON cert.student_id = u.id
      WHERE u.institution_id = ${(session.user as any).institutionId} AND u.role = 'student'
      GROUP BY u.id, u.name, u.email, u.created_at
      ORDER BY u.name
    `
    return NextResponse.json(students)
  } catch (error) {
    console.error("Institution students error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
