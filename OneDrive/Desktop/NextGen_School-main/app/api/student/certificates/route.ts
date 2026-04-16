import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const certificates = await sql`
      SELECT 
        cert.id,
        cert.issued_at,
        cert.certificate_url,
        c.title as course_title,
        c.id as course_id
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.student_id = ${session.user.id}
      ORDER BY cert.issued_at DESC
    `

    return NextResponse.json(certificates)
  } catch (error) {
    console.error("Certificates API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
