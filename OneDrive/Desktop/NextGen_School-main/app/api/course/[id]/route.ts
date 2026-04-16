import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { id } = await context.params
    const courses = await sql`SELECT * FROM courses WHERE id = ${id}`
    if (!courses.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
    
    return NextResponse.json(courses[0])
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { title, description, class: classGrade, thumbnail } = body
    
    console.log("Course ID:", id)
    console.log("User ID:", session.user.id)
    
    if (!title || !description || !classGrade) {
       return NextResponse.json({ error: "Title, description, and class are required" }, { status: 400 })
    }
    
    const uRole = (session.user as any).role;
    const isTeacher = uRole === 'teacher';
    const isInst = uRole === 'institution';
    const isAdmin = uRole === 'admin';
    const institutionId = (session.user as any).institutionId || session.user.id;
    
    let result;
    if (isAdmin) {
       result = await sql`
        UPDATE courses
        SET title = ${title}, description = ${description}, class = ${classGrade}, thumbnail = ${thumbnail || null}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id
      `
    } else if (isTeacher) {
       result = await sql`
        UPDATE courses
        SET title = ${title}, description = ${description}, class = ${classGrade}, thumbnail = ${thumbnail || null}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND teacher_id = ${session.user.id}
        RETURNING id
      `
    } else if (isInst) {
       result = await sql`
        UPDATE courses
        SET title = ${title}, description = ${description}, class = ${classGrade}, thumbnail = ${thumbnail || null}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND institution_id = ${institutionId}
        RETURNING id
      `
    } else {
        return NextResponse.json({ error: "Forbidden role" }, { status: 403 })
    }

    if (!result || !result.length) {
       return NextResponse.json({ error: "Unauthorized or course not found" }, { status: 403 })
    }

    return NextResponse.json({ success: true, course: result[0] })
  } catch (error) {
    console.error("Course PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
      const session = await auth()
      if (!session?.user?.id) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
  
      const { id } = await context.params
      const uRole = (session.user as any).role;
      const isTeacher = uRole === 'teacher';
      const isInst = uRole === 'institution';
      const isAdmin = uRole === 'admin';
      const institutionId = (session.user as any).institutionId || session.user.id;

      let result;
      if (isAdmin) {
          result = await sql`DELETE FROM courses WHERE id = ${id} RETURNING id`
      } else if (isTeacher) {
          result = await sql`DELETE FROM courses WHERE id = ${id} AND teacher_id = ${session.user.id} RETURNING id`
      } else if (isInst) {
          result = await sql`DELETE FROM courses WHERE id = ${id} AND institution_id = ${institutionId} RETURNING id`
      } else {
          return NextResponse.json({ error: "Forbidden role" }, { status: 403 })
      }

      if (!result || !result.length) {
          return NextResponse.json({ error: "Unauthorized or course not found" }, { status: 403 })
      }
  
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Course DELETE error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
