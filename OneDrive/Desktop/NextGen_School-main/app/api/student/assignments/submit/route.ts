import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignmentId, submissionText, fileUrl } = await request.json()

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 })
    }

    // 1. Verify Enrollment & Approval
    const assignment = await sql`
      SELECT a.course_id, e.status 
      FROM assignments a
      JOIN enrollments e ON e.course_id = a.course_id
      WHERE a.id = ${assignmentId} AND e.student_id = ${session.user.id}
    `

    if (assignment.length === 0 || assignment[0].status !== 'approved') {
      return NextResponse.json({ error: "You must be an approved student in this course." }, { status: 403 })
    }

    // 2. Check if already submitted
    const existing = await sql`
      SELECT id FROM assignment_submissions 
      WHERE assignment_id = ${assignmentId} AND student_id = ${session.user.id}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Assignment already submitted." }, { status: 400 })
    }

    // 3. Create Submission
    await sql`
      INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, file_url, status)
      VALUES (${assignmentId}, ${session.user.id}, ${submissionText}, ${fileUrl}, 'submitted')
    `

    return NextResponse.json({ success: true, message: "Assignment submitted successfully!" })
  } catch (error) {
    console.error("Assignment submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
