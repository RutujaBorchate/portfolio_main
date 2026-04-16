import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quizzes = await sql`
      SELECT 
        q.id, q.title, q.time_limit, q.passing_score, q.created_at,
        c.title as course_title, c.id as course_id,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
        (SELECT COUNT(*) FROM quiz_responses WHERE quiz_id = q.id) as submission_count
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE c.teacher_id = ${session.user.id}
      ORDER BY q.created_at DESC
    `
    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Teacher quizzes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, title, timeLimit, passingScore, maxAttempts, questions } = await request.json()

    if (!courseId || !title || !questions?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify teacher owns this course
    const course = await sql`SELECT id FROM courses WHERE id = ${courseId} AND teacher_id = ${session.user.id}`
    if (!course.length) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const quiz = await sql`
      INSERT INTO quizzes (course_id, title, time_limit, passing_score, max_attempts)
      VALUES (${courseId}, ${title}, ${timeLimit || 30}, ${passingScore || 70}, ${maxAttempts || 3})
      RETURNING id
    `

    const quizId = quiz[0].id
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const questionResult = await sql`
        INSERT INTO quiz_questions (quiz_id, question, order_number)
        VALUES (${quizId}, ${q.question}, ${i + 1})
        RETURNING id
      `
      const questionId = questionResult[0].id

      // Insert 4 options
      const options = [
        { text: q.option1, isCorrect: q.correctAnswer === 1 },
        { text: q.option2, isCorrect: q.correctAnswer === 2 },
        { text: q.option3, isCorrect: q.correctAnswer === 3 },
        { text: q.option4, isCorrect: q.correctAnswer === 4 },
      ]

      for (let j = 0; j < options.length; j++) {
        await sql`
          INSERT INTO quiz_options (question_id, option_text, is_correct, order_number)
          VALUES (${questionId}, ${options[j].text}, ${options[j].isCorrect ? 1 : 0}, ${j + 1})
        `
      }
    }

    return NextResponse.json({ id: quizId })
  } catch (error) {
    console.error("Create quiz error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
