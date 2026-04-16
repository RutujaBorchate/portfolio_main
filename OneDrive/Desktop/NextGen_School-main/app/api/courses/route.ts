import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    const isStudent = session?.user?.role === 'student'
    const studentClass = session?.user?.class

    console.log("Student Class:", session?.user?.class);

    let courses;
    if (isStudent && studentClass) {
      courses = await sql`
        SELECT 
          c.id, 
          c.title, 
          c.description,
          c.thumbnail,
          c.status,
          u.name as teacher_name,
          (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as total_modules,
          (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'approved') as enrolled_count
        FROM courses c
        LEFT JOIN users u ON c.teacher_id = u.id
        WHERE c.status = 'approved' AND c.class = ${String(studentClass)}
        ORDER BY c.created_at DESC
      `
    } else {
      courses = await sql`
        SELECT 
          c.id, 
          c.title, 
          c.description,
          c.thumbnail,
          c.status,
          u.name as teacher_name,
          (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as total_modules,
          (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'approved') as enrolled_count
        FROM courses c
        LEFT JOIN users u ON c.teacher_id = u.id
        WHERE c.status = 'approved'
        ORDER BY c.created_at DESC
      `
    }

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Courses API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
