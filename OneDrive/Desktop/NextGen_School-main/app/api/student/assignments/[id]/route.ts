import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params

    const result = await sql`
      SELECT 
        a.id, a.title, a.description, a.due_date, a.max_score,
        c.title as course_title,
        s.content,
        s.id IS NOT NULL as submitted,
        s.status as submission_status,
        s.score,
        s.feedback
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id AND e.student_id = ${session.user.id}
      LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ${session.user.id}
      WHERE a.id = ${id} AND e.status = 'approved'
    `
    if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Assignment detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
