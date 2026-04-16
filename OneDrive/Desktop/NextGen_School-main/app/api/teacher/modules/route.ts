import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, title, description, videoUrl, content } = await request.json()

    if (!courseId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const course = await sql`SELECT id FROM courses WHERE id = ${courseId} AND teacher_id = ${session.user.id}`
    if (!course.length) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const maxOrder = await sql`SELECT COALESCE(MAX(order_number), 0) as max_order FROM modules WHERE course_id = ${courseId}`
    const nextOrder = parseInt(maxOrder[0].max_order) + 1

    const result = await sql`
      INSERT INTO modules (course_id, title, description, video_url, content, order_number)
      VALUES (${courseId}, ${title}, ${description || ""}, ${videoUrl || null}, ${content || ""}, ${nextOrder})
      RETURNING id
    `
    return NextResponse.json({ id: result[0].id })
  } catch (error) {
    console.error("Create module error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
