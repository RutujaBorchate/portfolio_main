import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assignments = await sql`
      SELECT 
        a.id, a.title, a.due_date,
        c.title as course_title,
        (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE c.teacher_id = ${session.user.id}
      ORDER BY a.created_at DESC
    `

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Teacher Assignments API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, courseId, dueDate } = await request.json()

    if (!title || !courseId || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify ownership of the course
    const [course] = await sql`
      SELECT id FROM courses WHERE id = ${courseId} AND teacher_id = ${session.user.id}
    `

    if (!course) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await sql`
      INSERT INTO assignments (course_id, title, description, due_date)
      VALUES (${courseId}, ${title}, ${description}, ${dueDate})
    `

    return NextResponse.json({ success: true, message: "Assignment created successfully!" })
  } catch (error) {
    console.error("Teacher Assignment POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
