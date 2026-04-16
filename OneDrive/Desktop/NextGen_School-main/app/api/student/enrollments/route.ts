import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const enrollments = await sql`
      SELECT 
        c.id, 
        c.title, 
        c.description,
        c.thumbnail,
        u.name as teacher_name,
        e.progress,
        e.status,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as total_modules
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = ${session.user.id} AND e.status = 'approved'
      ORDER BY e.updated_at DESC
    `

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Enrollments API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
