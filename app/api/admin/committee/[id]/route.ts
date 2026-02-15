import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!auth) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, username, password } = await request.json()
    const committeeId = parseInt(params.id)

    if (!name || !email || !username) {
      return Response.json({ success: false, message: "Required fields are missing" }, { status: 400 })
    }

    // Check if username is already taken by another user
    const existingUser = await sql`
      SELECT id FROM committee WHERE username = ${username} AND id != ${committeeId}
    `

    if (existingUser.length > 0) {
      return Response.json({ success: false, message: "Username already exists" }, { status: 400 })
    }

    if (password) {
      await sql`
        UPDATE committee
        SET name = ${name}, email = ${email}, username = ${username}, password = ${password}
        WHERE id = ${committeeId}
      `
    } else {
      await sql`
        UPDATE committee
        SET name = ${name}, email = ${email}, username = ${username}
        WHERE id = ${committeeId}
      `
    }

    return Response.json({
      success: true,
      message: "Committee user updated successfully",
    })
  } catch (error) {
    console.error("Error updating committee user:", error)
    return Response.json({ success: false, message: "Failed to update committee user" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!auth) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const committeeId = parseInt(params.id)

    await sql`
      DELETE FROM committee WHERE id = ${committeeId}
    `

    return Response.json({
      success: true,
      message: "Committee user deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting committee user:", error)
    return Response.json({ success: false, message: "Failed to delete committee user" }, { status: 500 })
  }
}
