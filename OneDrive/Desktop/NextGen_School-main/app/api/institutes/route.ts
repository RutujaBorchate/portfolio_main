import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Only fetch institutes that have been approved (or if status is not used yet, fetch all where role is institution if we queried users, 
    // but we use the institutions table here explicitly)
    const institutes = await sql`
      SELECT id, name
      FROM institutions
      WHERE status = 'approved'
      ORDER BY name ASC
    `
    return NextResponse.json(institutes)
  } catch (error) {
    console.error("Fetch institutes API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
