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
    if (process.env.NODE_ENV === "development") {
      console.log("USER ID:", session?.user?.id);
    }

    // Get enrolled courses count (matches "My Courses" page logic)
    const enrolledResult = await sql`
      SELECT COUNT(*) as count FROM enrollments 
      WHERE student_id = ${userId} AND status = 'approved'
    `
    const enrolledCourses = parseInt(enrolledResult[0]?.count || "0")

    // Get total available courses for student class
    let totalCourses = 0
    if (session.user.class) {
      const totalResult = await sql`
        SELECT COUNT(*) as count FROM courses
        WHERE class = ${session.user.class} AND status = 'approved'
      `
      totalCourses = parseInt(totalResult[0]?.count || "0")
    }

    // Get completed courses count
    const completedResult = await sql`
      SELECT COUNT(*) as count FROM enrollments 
      WHERE student_id = ${userId} AND status = 'approved' AND progress = 100
    `
    const completedCourses = parseInt(completedResult[0]?.count || "0")

    // Get quiz stats
    const quizStatsResult = await sql`
      SELECT 
        COUNT(DISTINCT q.id) as total_quizzes,
        COUNT(DISTINCT qr.id) as completed_quizzes
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN quizzes q ON q.course_id = c.id
      LEFT JOIN quiz_responses qr ON qr.quiz_id = q.id AND qr.student_id = ${userId} AND qr.score >= q.passing_score
      WHERE e.student_id = ${userId} AND e.status = 'approved'
    `
    const totalQuizzes = parseInt(quizStatsResult[0]?.total_quizzes || "0")
    const completedQuizzes = parseInt(quizStatsResult[0]?.completed_quizzes || "0")

    // Get assignment stats
    const assignmentStatsResult = await sql`
      SELECT 
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT s.assignment_id) as completed_assignments
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN assignments a ON a.course_id = c.id
      LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ${userId} AND s.status = 'graded'
      WHERE e.student_id = ${userId} AND e.status = 'approved'
    `
    const totalAssignments = parseInt(assignmentStatsResult[0]?.total_assignments || "0")
    const completedAssignments = parseInt(assignmentStatsResult[0]?.completed_assignments || "0")

    // Get certificates count
    const certificatesResult = await sql`
      SELECT COUNT(*) as count FROM certificates WHERE student_id = ${userId}
    `
    const certificates = parseInt(certificatesResult[0]?.count || "0")

    // Get recent courses with progress
    const recentCourses = await sql`
      SELECT 
        c.id, 
        c.title, 
        e.progress,
        c.thumbnail
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ${userId} AND e.status = 'approved'
      ORDER BY e.updated_at DESC
      LIMIT 6
    `

    return NextResponse.json({
      enrolledCourses,
      totalCourses,
      completedCourses,
      totalQuizzes,
      completedQuizzes,
      totalAssignments,
      completedAssignments,
      certificates,
      recentCourses,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
