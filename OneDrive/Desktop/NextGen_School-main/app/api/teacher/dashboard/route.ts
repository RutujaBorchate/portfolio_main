import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user as any).role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = session.user.id
    if (process.env.NODE_ENV === "development") {
      console.log("USER ID:", session.user.id);
    }

    // Total courses created by this teacher
    const coursesResult = await sql`
      SELECT COUNT(*) as count FROM courses WHERE teacher_id = ${teacherId}
    `
    const totalCourses = parseInt(coursesResult[0]?.count || "0")

    // Total unique students enrolled in teacher's courses (all statuses)
    const studentsResult = await sql`
      SELECT COUNT(DISTINCT e.student_id) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.teacher_id = ${teacherId}
    `
    const totalStudents = parseInt(studentsResult[0]?.count || "0")

    // Total quizzes for courses created by this teacher
    const quizzesResult = await sql`
      SELECT COUNT(*) as count 
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE c.teacher_id = ${teacherId}
    `
    const totalQuizzes = parseInt(quizzesResult[0]?.count || "0")

    // Total assignments for courses created by this teacher
    const assignmentsResult = await sql`
      SELECT COUNT(*) as count 
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE c.teacher_id = ${teacherId}
    `
    const totalAssignments = parseInt(assignmentsResult[0]?.count || "0")

    // Pending enrollments (Approvals)
    const pendingEnrollmentsResult = await sql`
      SELECT COUNT(*) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.teacher_id = ${teacherId} AND e.status = 'pending'
    `
    const pendingEnrollments = parseInt(pendingEnrollmentsResult[0]?.count || "0")

    // Pending assignment submissions
    const pendingResult = await sql`
      SELECT COUNT(*) as count 
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE c.teacher_id = ${teacherId} AND s.status = 'submitted'
    `
    const pendingSubmissions = parseInt(pendingResult[0]?.count || "0")
    
    console.log("DEBUG: Teacher Stats Result", { totalCourses, totalStudents, pendingEnrollments, pendingSubmissions });

    // Recent courses with enrollment count
    const recentCourses = await sql`
      SELECT 
        c.id, 
        c.title, 
        c.status,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'approved') as enrolled_count
      FROM courses c
      WHERE c.teacher_id = ${teacherId}
      ORDER BY c.created_at DESC
      LIMIT 5
    `

    return NextResponse.json({
      totalCourses,
      totalStudents,
      totalQuizzes,
      totalAssignments,
      pendingEnrollments,
      pendingSubmissions,
      recentCourses,
    })
  } catch (error) {
    console.error("Teacher dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
