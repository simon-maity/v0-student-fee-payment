import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!auth) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const items = await sql`
      SELECT id, name, description, available_quantity, unit
      FROM stationery_items
      WHERE is_active = true
      ORDER BY name ASC
    `

    return Response.json({
      success: true,
      items: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        available_quantity: item.available_quantity,
        unit: item.unit,
      })),
    })
  } catch (error) {
    console.error("Error fetching stationery items:", error)
    return Response.json({ success: false, message: "Failed to fetch items" }, { status: 500 })
  }
}
