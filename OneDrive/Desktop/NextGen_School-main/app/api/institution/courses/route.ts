import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user as any).role !== "institution") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const institutionId = (session.user as any).institutionId
    console.log("DEBUG: Institution Fetching Courses", { institutionId });

    // Fetch courses with enrollment counts
    const courses = await sql`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.status,
        c.thumbnail,
        c.class,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'approved') as enrolled_count
      FROM courses c
      WHERE c.institution_id = ${institutionId}
      ORDER BY c.created_at DESC
    `

    console.log(`DEBUG: Found ${courses.length} courses for institution ${institutionId}`);

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Institution courses API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user as any).role !== "institution") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, thumbnail, class: classGrade } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const institutionId = (session.user as any).institutionId

    const result = await sql`
      INSERT INTO courses (
        title, 
        description, 
        thumbnail, 
        institution_id, 
        class, 
        class_group,
        status
      ) VALUES (
        ${title},
        ${description || ""},
        ${thumbnail || null},
        ${institutionId},
        ${classGrade},
        ${classGrade},
        'pending'
      )
      RETURNING id
    `

    return NextResponse.json({ id: result[0].id })
  } catch (error) {
    console.error("Institution course creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
