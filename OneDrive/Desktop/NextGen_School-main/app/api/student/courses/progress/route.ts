import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { moduleId, courseId, completed } = await request.json()

    if (!moduleId || !courseId) {
      return NextResponse.json({ error: "Module ID and Course ID required" }, { status: 400 })
    }

    // 1. Update module_progress
    if (completed) {
      await sql`
        INSERT INTO module_progress (module_id, student_id, completed, completed_at)
        VALUES (${moduleId}, ${session.user.id}, 1, DATETIME('now'))
        ON CONFLICT(module_id, student_id) DO UPDATE SET completed = 1, completed_at = DATETIME('now')
      `
    } else {
      await sql`
        UPDATE module_progress 
        SET completed = 0, completed_at = NULL 
        WHERE module_id = ${moduleId} AND student_id = ${session.user.id}
      `
    }

    // 2. Re-calculate overall course progress
    const [stats] = await sql`
      SELECT 
        (SELECT COUNT(*) FROM modules WHERE course_id = ${courseId}) as total_modules,
        (SELECT COUNT(*) FROM module_progress mp 
         JOIN modules m ON mp.module_id = m.id 
         WHERE m.course_id = ${courseId} AND mp.student_id = ${session.user.id} AND mp.completed = 1) as completed_count
    `

    const totalModules = parseInt(stats.total_modules || "0")
    const completedCount = parseInt(stats.completed_count || "0")
    const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

    // 3. Update enrollment table
    await sql`
      UPDATE enrollments 
      SET progress = ${progressPercent}, 
          updated_at = DATETIME('now'),
          completed_at = ${progressPercent === 100 ? "DATETIME('now')" : "NULL"}
      WHERE student_id = ${session.user.id} AND course_id = ${courseId}
    `

    return NextResponse.json({ 
      success: true, 
      progress: progressPercent,
      isNewlyCompleted: progressPercent === 100 
    })
  } catch (error) {
    console.error("Progress update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
