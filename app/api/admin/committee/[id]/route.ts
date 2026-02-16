import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"
import bcryptjs from "bcryptjs"

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

    const { full_name, email, username, password, status } = await request.json()
    const committeeId = parseInt(params.id)

    if (!full_name || !email || !username) {
      return Response.json({ success: false, message: "Required fields are missing" }, { status: 400 })
    }

    // Check if username or email is already taken by another user
    const existingUser = await sql`
      SELECT id FROM committee_users WHERE (username = ${username} OR email = ${email}) AND id != ${committeeId}
    `

    if (existingUser.length > 0) {
      return Response.json({ success: false, message: "Username or email already exists" }, { status: 400 })
    }

    if (password) {
      const hashedPassword = await bcryptjs.hash(password, 10)
      await sql`
        UPDATE committee_users
        SET full_name = ${full_name}, email = ${email}, username = ${username}, password_hash = ${hashedPassword}, status = ${status || "active"}, updated_at = NOW()
        WHERE id = ${committeeId}
      `
    } else {
      await sql`
        UPDATE committee_users
        SET full_name = ${full_name}, email = ${email}, username = ${username}, status = ${status || "active"}, updated_at = NOW()
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
      DELETE FROM committee_users WHERE id = ${committeeId}
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
