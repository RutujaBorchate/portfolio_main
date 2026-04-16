import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { sendEmail, mailTemplates } from "@/lib/mail"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("DEBUG: Teacher Fetching Enrollments", { 
      userId: session.user.id, 
      role: session.user.role 
    });

    const enrollments = await sql`
      SELECT 
        e.id, e.status, e.enrolled_at, e.progress,
        u.name as student_name, u.email as student_email,
        c.title as course_title
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE c.teacher_id = ${session.user.id}
      ORDER BY e.enrolled_at DESC
    `

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Teacher Enrollments API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { enrollmentId, status } = await request.json()

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Verify ownership
    const enrollment = await sql`
      SELECT e.id 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.id = ${enrollmentId} AND c.teacher_id = ${session.user.id}
    `

    if (enrollment.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await sql`
      UPDATE enrollments 
      SET status = ${status}, teacher_approval = ${status === 'approved' ? 1 : 0}, updated_at = DATETIME('now')
      WHERE id = ${enrollmentId}
    `

    // --- NEW: Email Notification ---
    if (status === 'approved') {
      try {
        const [details] = await sql`
          SELECT u.name as student_name, u.email as student_email, c.title as course_title
          FROM enrollments e 
          JOIN users u ON e.student_id = u.id
          JOIN courses c ON e.course_id = c.id
          WHERE e.id = ${enrollmentId}
        `
        const template = mailTemplates.enrollmentApproved(details.student_name, details.course_title)
        await sendEmail({
          to: details.student_email,
          ...template
        })
      } catch (error) {
        console.error("Failed to send approval email:", error)
      }
    }
    // ----------------------------


    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Teacher Enrollments PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
