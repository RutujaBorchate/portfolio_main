import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    console.log("DEBUG: Student Accessing Quizzes", { userId, email: session.user.email });

    const quizzes = await sql`
      SELECT 
        q.id,
        q.title,
        q.time_limit,
        q.passing_score,
        q.max_attempts,
        c.title as course_title,
        c.id as course_id,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as total_questions,
        COALESCE(
          (SELECT COUNT(*) FROM quiz_responses WHERE quiz_id = q.id AND student_id = ${session.user.id}),
          0
        ) as attempts,
        COALESCE(
          (SELECT (CASE WHEN score >= q.passing_score THEN 1 ELSE 0 END) FROM quiz_responses WHERE quiz_id = q.id AND student_id = ${session.user.id} ORDER BY score DESC LIMIT 1),
          0
        ) as passed,
        (SELECT MAX(score) FROM quiz_responses WHERE quiz_id = q.id AND student_id = ${session.user.id}) as best_score
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id
      WHERE e.student_id = ${session.user.id} AND e.status = 'approved'
      ORDER BY q.created_at DESC
    `

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Quizzes API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
