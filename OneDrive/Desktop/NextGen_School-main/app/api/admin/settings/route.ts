import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await sql`SELECT allow_registration, auto_approve_teachers FROM platform_settings WHERE id = 1`
    return NextResponse.json(settings[0] || { allow_registration: true, auto_approve_teachers: false })
  } catch (error) {
    console.error("Admin settings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { allow_registration, auto_approve_teachers } = body

    await sql`
      UPDATE platform_settings 
      SET allow_registration = ${allow_registration ? 1 : 0}, 
          auto_approve_teachers = ${auto_approve_teachers ? 1 : 0},
          updated_at = DATETIME('now')
      WHERE id = 1
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin settings PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
