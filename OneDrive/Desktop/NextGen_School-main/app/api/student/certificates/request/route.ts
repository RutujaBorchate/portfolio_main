import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { randomBytes } from "crypto"
import { sendEmail, mailTemplates } from "@/lib/mail"

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

    // 1. Verify Completion
    const enrollment = await sql`
      SELECT progress, status FROM enrollments 
      WHERE student_id = ${session.user.id} AND course_id = ${courseId}
    `

    if (enrollment.length === 0 || enrollment[0].progress < 100) {
      return NextResponse.json({ error: "Course must be 100% completed to issue a certificate." }, { status: 400 })
    }

    // 2. Check if already exists
    const existing = await sql`
      SELECT id FROM certificates 
      WHERE student_id = ${session.user.id} AND course_id = ${courseId}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Certificate already issued for this course." }, { status: 400 })
    }

    // 3. Generate Unique Certificate Number
    const certNumber = "CERT-" + randomBytes(4).toString("hex").toUpperCase()

    // 4. Issue Certificate
    await sql`
      INSERT INTO certificates (student_id, course_id, certificate_number, issued_at)
      VALUES (${session.user.id}, ${courseId}, ${certNumber}, DATETIME('now'))
    `

    // --- NEW: Email Notification ---
    try {
      const [details] = await sql`
        SELECT u.name as student_name, u.email as student_email, c.title as course_title
        FROM users u 
        JOIN courses c ON c.id = ${courseId}
        WHERE u.id = ${session.user.id}
      `
      const template = mailTemplates.certificateIssued(details.student_name, details.course_title, certNumber)
      await sendEmail({
        to: details.student_email,
        ...template
      })
    } catch (error) {
      console.error("Failed to send certificate email:", error)
    }
    // ----------------------------


    return NextResponse.json({ 
      success: true, 
      message: "Certificate generated successfully!",
      certificateNumber: certNumber
    })
  } catch (error) {
    console.error("Certificate request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
