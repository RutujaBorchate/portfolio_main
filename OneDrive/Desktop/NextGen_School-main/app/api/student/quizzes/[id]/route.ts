import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // 1. Fetch Quiz Details
    const [quiz] = await sql`
      SELECT id, title, time_limit, passing_score 
      FROM quizzes WHERE id = ${id}
    `

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // 2. Check if already completed
    const [response] = await sql`
      SELECT id, score, completed_at FROM quiz_responses 
      WHERE quiz_id = ${id} AND student_id = ${session.user.id}
    `

    // 3. Fetch Questions & Options
    const questions = await sql`
      SELECT q.id, q.question, q.question_type, q.points, q.order_number
      FROM quiz_questions q
      WHERE q.quiz_id = ${id}
      ORDER BY q.order_number ASC
      LIMIT 10
    `

    const questionIds = questions.map((q: any) => q.id)
    if (questionIds.length === 0) {
      return NextResponse.json({
        ...quiz,
        questions: [],
        options: [],
        completed: !!response,
        previousScore: response?.score
      })
    }

    const options = await sql`
      SELECT id, question_id, option_text, order_number
      FROM quiz_options
      WHERE question_id IN (${questionIds})
      ORDER BY order_number ASC
    `

    return NextResponse.json({
      ...quiz,
      questions,
      options,
      completed: !!response,
      previousScore: response?.score
    })
  } catch (error) {
    console.error("Quiz API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
