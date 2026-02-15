import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

function generateSessionToken(username: string, password: string): string {
  const credentials = `${username}:${password}`
  return Buffer.from(credentials, "utf-8").toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return Response.json({ success: false, message: "Username and password are required" }, { status: 400 })
    }

    const result = await sql`
      SELECT id, name, email, username, is_active
      FROM committee
      WHERE username = ${username} AND password = ${password}
    `

    if (result.length === 0) {
      return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const committee = result[0]

    if (!committee.is_active) {
      return Response.json({ success: false, message: "Account is inactive" }, { status: 401 })
    }

    const sessionToken = generateSessionToken(username, password)

    return Response.json({
      success: true,
      token: sessionToken,
      committee: {
        id: committee.id,
        name: committee.name,
        email: committee.email,
        username: committee.username,
      },
    })
  } catch (error) {
    console.error("Committee login error:", error)
    return Response.json({ success: false, message: "Login failed" }, { status: 500 })
  }
}
