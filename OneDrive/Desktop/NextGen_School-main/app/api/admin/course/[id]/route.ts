import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const unawaitedParams = context.params as any
    const id = unawaitedParams.id ?? (await context.params).id

    const body = await request.json()
    const { status } = body

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Courses table already has a 'status' column
    await sql`
      UPDATE courses
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true, message: `Course ${status} successfully` })
  } catch (error) {
    console.error("Update course API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
