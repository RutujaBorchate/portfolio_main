import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params

    const course = await sql`
      SELECT c.id, c.title, c.description, c.status,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'approved') as enrolled_count,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as modules_count
      FROM courses c
      WHERE c.id = ${id} AND c.teacher_id = ${session.user.id}
    `
    if (!course.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const modules = await sql`
      SELECT id, title, description, video_url, content, order_number
      FROM modules WHERE course_id = ${id} ORDER BY order_number
    `

    return NextResponse.json({ ...course[0], modules })
  } catch (error) {
    console.error("Course detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    await sql`DELETE FROM courses WHERE id = ${id} AND teacher_id = ${session.user.id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
