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

    // Get the institution_id if linked
    const user = await sql`SELECT institution_id FROM users WHERE id = ${id} AND role = 'institution'`
    const institutionId = user[0]?.institution_id

    // Update the user record
    await sql`
      UPDATE users
      SET is_approved = ${is_approved}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND role = 'institution'
    `

    // Update the institutions table if linked
    if (institutionId) {
      await sql`
        UPDATE institutions
        SET status = ${status}
        WHERE id = ${institutionId}
      `
    }

    return NextResponse.json({ success: true, message: `Institute ${status} successfully` })
  } catch (error) {
    console.error("Update institute API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
