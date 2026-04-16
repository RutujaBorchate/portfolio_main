import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignmentId, content } = await request.json()
    if (!assignmentId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existing = await sql`
      SELECT id FROM assignment_submissions WHERE assignment_id = ${assignmentId} AND student_id = ${session.user.id}
    `
    if (existing.length) {
      return NextResponse.json({ error: "Already submitted" }, { status: 400 })
    }

    await sql`
      INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, status)
      VALUES (${assignmentId}, ${session.user.id}, ${content}, 'submitted')
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Submit assignment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
