import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { certNumber: string } }
) {
  try {
    const { certNumber } = params

    const [certificate] = await sql`
      SELECT 
        c.certificate_number,
        c.issued_at,
        u.name as student_name,
        co.title as course_title,
        co.description as course_description,
        t.name as teacher_name
      FROM certificates c
      JOIN users u ON c.student_id = u.id
      JOIN courses co ON c.course_id = co.id
      JOIN users t ON co.teacher_id = t.id
      WHERE c.certificate_number = ${certNumber}
    `

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found or invalid." }, { status: 404 })
    }

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("Certificate verification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
