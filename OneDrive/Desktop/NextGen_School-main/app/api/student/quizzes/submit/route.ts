import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quizId, answers } = await request.json() // answers: { [questionId]: optionId }

    if (!quizId || !answers) {
      return NextResponse.json({ error: "Quiz ID and answers required" }, { status: 400 })
    }

    // 1. Check if already submitted (Locking logic)
    const existingResponse = await sql`
      SELECT id FROM quiz_responses 
      WHERE quiz_id = ${quizId} AND student_id = ${session.user.id}
    `

    if (existingResponse.length > 0) {
      return NextResponse.json({ error: "You have already completed this quiz. Max 1 attempt allowed." }, { status: 403 })
    }

    // 2. Fetch correct options
    const questions = await sql`
      SELECT q.id, o.id as correct_option_id
      FROM quiz_questions q
      JOIN quiz_options o ON o.question_id = q.id
      WHERE q.quiz_id = ${quizId} AND o.is_correct = 1
    `

    let score = 0
    questions.forEach((q: any) => {
      if (answers[q.id] === q.correct_option_id) {
        score += 1
      }
    })

    const finalScore = Math.round((score / questions.length) * 100)

    // 3. Save Response
    const response = await sql`
      INSERT INTO quiz_responses (quiz_id, student_id, score, completed_at)
      VALUES (${quizId}, ${session.user.id}, ${finalScore}, DATETIME('now'))
      RETURNING id
    `

    // 4. Save individual answers
    const responseId = response[0].id
    for (const [qId, oId] of Object.entries(answers)) {
      await sql`
        INSERT INTO quiz_answers (response_id, question_id, selected_option_id)
        VALUES (${responseId}, ${qId}, ${oId})
      `
    }

    return NextResponse.json({ 
      success: true, 
      score: finalScore, 
      passed: finalScore >= 70,
      total: questions.length,
      correct: score
    })
  } catch (error) {
    console.error("Quiz submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
