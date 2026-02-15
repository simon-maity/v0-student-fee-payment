import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

function decodeAuth(token: string): { role: string } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    return { role: "admin" }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!auth) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const committee = await sql`
      SELECT id, name, email, username, is_active, created_at
      FROM committee
      ORDER BY created_at DESC
    `

    return Response.json({
      success: true,
      committee: committee.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        username: c.username,
        is_active: c.is_active,
        created_at: c.created_at,
      })),
    })
  } catch (error) {
    console.error("Error fetching committee:", error)
    return Response.json({ success: false, message: "Failed to fetch committee" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!auth) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, username, password } = await request.json()

    if (!name || !email || !username || !password) {
      return Response.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await sql`
      SELECT id FROM committee WHERE username = ${username}
    `

    if (existingUser.length > 0) {
      return Response.json({ success: false, message: "Username already exists" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO committee (name, email, username, password, is_active, created_at)
      VALUES (${name}, ${email}, ${username}, ${password}, true, NOW())
      RETURNING id
    `

    return Response.json({
      success: true,
      message: "Committee user created successfully",
      id: result[0].id,
    })
  } catch (error) {
    console.error("Error creating committee user:", error)
    return Response.json({ success: false, message: "Failed to create committee user" }, { status: 500 })
  }
}
