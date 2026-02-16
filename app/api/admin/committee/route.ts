import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"
import bcryptjs from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!auth) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const committee = await sql`
      SELECT id, full_name, email, username, status, created_at
      FROM committee_users
      ORDER BY created_at DESC
    `

    return Response.json({
      success: true,
      committee: committee.map((c: any) => ({
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        username: c.username,
        status: c.status,
        created_at: c.created_at,
      })),
    })
  } catch (error) {
    console.error("Error fetching committee:", error)
    return Response.json({ success: false, message: "Failed to fetch committee users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!auth) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { full_name, email, username, password } = await request.json()

    if (!full_name || !email || !username || !password) {
      return Response.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check if username or email already exists
    const existingUser = await sql`
      SELECT id FROM committee_users 
      WHERE username = ${username} OR email = ${email}
    `

    if (existingUser.length > 0) {
      return Response.json({ success: false, message: "Username or email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    const result = await sql`
      INSERT INTO committee_users (full_name, email, username, password_hash, status, created_at, updated_at)
      VALUES (${full_name}, ${email}, ${username}, ${hashedPassword}, 'active', NOW(), NOW())
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
