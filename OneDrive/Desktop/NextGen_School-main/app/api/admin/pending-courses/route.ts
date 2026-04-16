import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingCourses = await sql`
      SELECT c.id, c.title, c.description, c.created_at, u.name as teacher_name, u.email as teacher_email
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.status = 'pending'
      ORDER BY c.created_at DESC
    `

    return NextResponse.json(pendingCourses)
  } catch (error) {
    console.error("Pending courses API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
