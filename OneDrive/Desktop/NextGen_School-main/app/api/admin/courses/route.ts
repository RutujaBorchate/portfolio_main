import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    // Only admin can access this route
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { title, description, symbol, teacherId, classGrade } = data

    if (!title || !description || !teacherId || !classGrade) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch the institution_id of the assigned teacher to maintain correct mapping
    const teacherLookup = await sql`SELECT institution_id FROM users WHERE id = ${teacherId}`
    const institutionId = teacherLookup[0]?.institution_id || null

    // Insert into courses table
    const result = await sql`
      INSERT INTO courses (
        title, 
        description, 
        thumbnail, 
        teacher_id, 
        institution_id,
        class_group,
        class, 
        created_by_admin, 
        status
      ) VALUES (
        ${title},
        ${description},
        ${symbol || null},
        ${teacherId},
        ${institutionId},
        ${classGrade},
        ${classGrade},
        true,
        'approved'
      )
      RETURNING id
    `
    
    // Check if result has rows (for Drizzle/Postgres usually it does, better-sqlite3 returns lastInsertRowid in 'result' if we used run, but 'sql' wrapper uses run for INSERT and returns it)
    // Wait, let's verify what `sql` returns for INSERT in lib/db.ts
    // It returns `stmt.run(...values)`. which has `lastInsertRowid`.

    return NextResponse.json({ 
      success: true, 
      message: "Course created successfully",
      courseId: result?.lastInsertRowid || result?.[0]?.id 
    })
    
  } catch (error) {
    console.error("Admin course creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
