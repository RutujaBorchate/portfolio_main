import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user as any).role !== "institution") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await sql`
      SELECT 
        u.name as student_name,
        u.email as student_email,
        c.title as course_title,
        e.progress,
        e.status as enrollment_status,
        e.enrolled_at,
        CASE WHEN cert.id IS NOT NULL THEN 'Yes' ELSE 'No' END as certificate_earned
      FROM users u
      JOIN enrollments e ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN certificates cert ON cert.student_id = u.id AND cert.course_id = c.id
      WHERE u.institution_id = ${(session.user as any).institutionId}
      ORDER BY u.name, c.title
    `
    return NextResponse.json(data)
  } catch (error) {
    console.error("Institution reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
