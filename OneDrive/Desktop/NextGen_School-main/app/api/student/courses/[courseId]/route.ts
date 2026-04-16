import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = params

    // 1. Verify Enrollment & Status
    const enrollment = await sql`
      SELECT status, progress 
      FROM enrollments 
      WHERE student_id = ${session.user.id} AND course_id = ${courseId}
    `

    if (enrollment.length === 0) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 })
    }

    if (enrollment[0].status !== "approved") {
      return NextResponse.json({ 
        error: "Pending Approval", 
        message: "Your enrollment is waiting for teacher approval." 
      }, { status: 403 })
    }

    // 2. Fetch Course & Modules with Progress
    const [course] = await sql`
      SELECT id, title, description, thumbnail 
      FROM courses WHERE id = ${courseId}
    `

    const modules = await sql`
      SELECT 
        m.id, m.title, m.description, m.video_url, m.order_number, m.duration_minutes,
        EXISTS (SELECT 1 FROM module_progress WHERE module_id = m.id AND student_id = ${session.user.id} AND completed = 1) as completed
      FROM modules m
      WHERE m.course_id = ${courseId}
      ORDER BY m.order_number ASC
    `

    return NextResponse.json({
      ...course,
      modules,
      enrollment: enrollment[0]
    })
  } catch (error) {
    console.error("Course details API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
