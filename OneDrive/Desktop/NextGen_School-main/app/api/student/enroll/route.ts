import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Check if already enrolled
    const existing = await sql`
      SELECT id FROM enrollments 
      WHERE student_id = ${session.user.id} AND course_id = ${courseId}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 })
    }

    // Create enrollment (Now requires teacher approval)
    await sql`
      INSERT INTO enrollments (student_id, course_id, status, progress, teacher_approval)
      VALUES (${session.user.id}, ${courseId}, 'pending', 0, 0)
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Enroll API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
