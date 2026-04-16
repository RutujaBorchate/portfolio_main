import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const courses = await sql`
      SELECT 
        c.id, 
        c.title, 
        c.description,
        c.status,
        c.created_at,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as total_enrolled,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'approved') as approved_enrolled,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as modules_count
      FROM courses c
      WHERE c.teacher_id = ${session.user.id}
      ORDER BY c.created_at DESC
    `
    if (process.env.NODE_ENV === "development") {
      console.log("USER ID:", session?.user?.id);
    }

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Teacher courses API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, class: classGrade } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const institutionId = (session.user as any).institutionId || null;

    const result = await sql`
      INSERT INTO courses (teacher_id, title, description, status, class, class_group, institution_id)
      VALUES (${session.user.id}, ${title}, ${description || ""}, 'pending', ${classGrade}, ${classGrade}, ${institutionId})
      RETURNING id
    `

    return NextResponse.json({ id: result[0].id })
  } catch (error) {
    console.error("Create course API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
