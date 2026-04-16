import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { hashSync } from "bcryptjs"

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, password } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
      }
      const hashedPassword = hashSync(password, 10)
      await sql`
        UPDATE users 
        SET name = ${name}, 
            password_hash = ${hashedPassword}, 
            updated_at = DATETIME('now')
        WHERE id = ${session.user.id}
      `
    } else {
      await sql`
        UPDATE users 
        SET name = ${name}, 
            updated_at = DATETIME('now')
        WHERE id = ${session.user.id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin profile PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
