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

    const is_approved = status === "approved"

    // Optional: could delete the user if rejected? The prompt says "convert internally to set is_approved = false".
    // I will just set is_approved.
    await sql`
      UPDATE users
      SET is_approved = ${is_approved}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND role = 'teacher'
    `

    return NextResponse.json({ success: true, message: `Teacher ${status} successfully` })
  } catch (error) {
    console.error("Update teacher API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
