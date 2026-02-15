import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

function decodeAuth(token: string): { id: number; username: string; name: string } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [username, password] = decoded.split(":")
    return { id: 0, username, name: username }
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

    const decoded = decodeAuth(auth)
    if (!decoded) {
      return Response.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const committeeResult = await sql`
      SELECT id FROM committee
      WHERE username = ${decoded.username}
      LIMIT 1
    `

    if (committeeResult.length === 0) {
      return Response.json({ success: false, message: "Committee not found" }, { status: 401 })
    }

    const committeeId = committeeResult[0].id

    const requests = await sql`
      SELECT 
        sr.id,
        si.name as itemName,
        si.unit,
        sr.quantity_requested as quantityRequested,
        sr.status,
        sr.created_at as requestDate,
        sr.purpose,
        NULL as reviewedByName,
        sr.reviewed_at as reviewedAt,
        sr.rejection_reason as rejectionReason
      FROM stationery_requests sr
      JOIN stationery_items si ON sr.item_id = si.id
      WHERE sr.requester_id = ${committeeId} AND sr.requester_type = 'committee'
      ORDER BY sr.created_at DESC
    `

    return Response.json({
      success: true,
      requests: requests.map((r: any) => ({
        id: r.id,
        itemName: r.itemname,
        unit: r.unit,
        quantityRequested: r.quantityrequested,
        status: r.status,
        requestDate: r.requestdate,
        purpose: r.purpose,
        reviewedByName: r.reviewedbyname,
        reviewedAt: r.reviewedat,
        rejectionReason: r.rejectionreason,
      })),
    })
  } catch (error) {
    console.error("Error fetching requests:", error)
    return Response.json({ success: false, message: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!auth) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const decoded = decodeAuth(auth)
    if (!decoded) {
      return Response.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const committeeResult = await sql`
      SELECT id FROM committee
      WHERE username = ${decoded.username}
      LIMIT 1
    `

    if (committeeResult.length === 0) {
      return Response.json({ success: false, message: "Committee not found" }, { status: 401 })
    }

    const committeeId = committeeResult[0].id
    const { itemId, quantityRequested, purpose } = await request.json()

    if (!itemId || !quantityRequested) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const itemResult = await sql`
      SELECT id, name, unit FROM stationery_items WHERE id = ${parseInt(itemId)}
    `

    if (itemResult.length === 0) {
      return Response.json({ success: false, error: "Item not found" }, { status: 404 })
    }

    const item = itemResult[0]

    const result = await sql`
      INSERT INTO stationery_requests (requester_id, requester_type, item_id, quantity_requested, purpose, status, created_at)
      VALUES (${committeeId}, 'committee', ${parseInt(itemId)}, ${parseInt(quantityRequested)}, ${purpose || ""}, 'pending', NOW())
      RETURNING id
    `

    return Response.json({
      success: true,
      message: "Request submitted successfully",
      requestId: result[0].id,
    })
  } catch (error) {
    console.error("Error creating request:", error)
    return Response.json({ success: false, error: "Failed to create request" }, { status: 500 })
  }
}
