import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"
import bcryptjs from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

function generateSessionToken(id: number, username: string): string {
  const credentials = `${id}:${username}:${Date.now()}`
  return Buffer.from(credentials, "utf-8").toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return Response.json({ success: false, message: "Username and password are required" }, { status: 400 })
    }

    const result = await sql`
      SELECT id, full_name, email, username, password_hash, status
      FROM committee_users
      WHERE username = ${username}
    `

    if (result.length === 0) {
      return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const committee = result[0]

    if (committee.status !== "active") {
      return Response.json({ success: false, message: "Account is inactive" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, committee.password_hash)
    if (!isPasswordValid) {
      return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const sessionToken = generateSessionToken(committee.id, committee.username)

    return Response.json({
      success: true,
      token: sessionToken,
      committee: {
        id: committee.id,
        full_name: committee.full_name,
        email: committee.email,
        username: committee.username,
      },
    })
  } catch (error) {
    console.error("Committee login error:", error)
    return Response.json({ success: false, message: "Login failed" }, { status: 500 })
  }
}
