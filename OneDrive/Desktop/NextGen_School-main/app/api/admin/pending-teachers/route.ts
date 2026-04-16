import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingUsers = await sql`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE role IN ('teacher', 'institution') AND is_approved = false
      ORDER BY created_at DESC
    `

    return NextResponse.json(pendingUsers)
  } catch (error) {
    console.error("Pending teachers API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
