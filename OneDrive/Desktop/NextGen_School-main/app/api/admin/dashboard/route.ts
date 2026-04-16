import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (process.env.NODE_ENV === "development") {
      console.log("USER ID:", session.user.id);
    }

    const [
      usersCount, 
      studentsCount, 
      teachersCount,
      institutionsCount, 
      coursesCount, 
      enrollmentsCount, 
      completionsCount,
      pendingApprovals,
      pendingTeachers,
      pendingCourses,
      recentUsers,
      userGrowthRaw,
      courseTrendsRaw
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`,
      sql`SELECT COUNT(*) as count FROM users WHERE role = 'teacher'`,
      sql`SELECT COUNT(*) as count FROM users WHERE role = 'institution'`,
      sql`SELECT COUNT(*) as count FROM courses`,
      sql`SELECT COUNT(*) as count FROM enrollments WHERE status = 'approved'`,
      sql`SELECT COUNT(*) as count FROM enrollments WHERE progress = 100`,
      sql`SELECT COUNT(*) as count FROM users WHERE is_approved = 0 AND role != 'student'`,
      sql`SELECT COUNT(*) as count FROM users WHERE is_approved = 0 AND role = 'teacher'`,
      sql`SELECT COUNT(*) as count FROM courses WHERE status = 'pending'`,
      sql`SELECT id, name, email, role, is_approved, created_at FROM users ORDER BY created_at DESC LIMIT 5`,
      sql`SELECT strftime('%m', created_at) as month, COUNT(*) as count FROM users GROUP BY month ORDER BY month DESC LIMIT 6`,
      sql`SELECT strftime('%m', created_at) as month, COUNT(*) as count FROM courses GROUP BY month ORDER BY month DESC LIMIT 6`
    ])

    const monthNames: {[key: string]: string} = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    }

    const userGrowth = userGrowthRaw.map((r: any) => ({
      date: monthNames[r.month] || r.month,
      count: parseInt(r.count)
    })).reverse()

    const courseTrends = courseTrendsRaw.map((r: any) => ({
      date: monthNames[r.month] || r.month,
      count: parseInt(r.count)
    })).reverse()

    const totalStudents = parseInt(studentsCount[0]?.count || "0")
    const totalTeachers = parseInt(teachersCount[0]?.count || "0")
    
    const ratio = totalTeachers > 0 ? (totalStudents / totalTeachers).toFixed(1) : totalStudents

    return NextResponse.json({
      totalUsers: parseInt(usersCount[0]?.count || "0"),
      totalStudents,
      totalTeachers,
      totalInstitutions: parseInt(institutionsCount[0]?.count || "0"),
      totalCourses: parseInt(coursesCount[0]?.count || "0"),
      totalEnrollments: parseInt(enrollmentsCount[0]?.count || "0"),
      totalCompletions: parseInt(completionsCount[0]?.count || "0"),
      pendingApprovals: parseInt(pendingApprovals[0]?.count || "0"),
      pendingTeachers: parseInt(pendingTeachers[0]?.count || "0"),
      pendingCourses: parseInt(pendingCourses[0]?.count || "0"),
      studentTeacherRatio: ratio,
      recentUsers,
      userGrowth,
      courseTrends,
      roleDistribution: [
        { name: 'Students', value: totalStudents },
        { name: 'Teachers', value: totalTeachers },
        { name: 'Institutions', value: parseInt(institutionsCount[0]?.count || "0") }
      ]
    })
  } catch (error) {
    console.error("Admin dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
