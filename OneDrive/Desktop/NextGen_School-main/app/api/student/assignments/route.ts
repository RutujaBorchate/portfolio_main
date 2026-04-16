import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    console.log("DEBUG: Student Accessing Assignments", { userId, email: session.user.email });

    const assignments = await sql`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.due_date,
        a.max_score,
        c.title as course_title,
        c.id as course_id,
        s.id IS NOT NULL as submitted,
        s.status as submission_status,
        s.score,
        s.feedback
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ${session.user.id}
      WHERE e.student_id = ${session.user.id} AND e.status = 'approved'
      ORDER BY a.due_date ASC
    `

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Assignments API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
