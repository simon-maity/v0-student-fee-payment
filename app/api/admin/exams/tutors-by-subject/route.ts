import { neon } from "@neondatabase/serverless"
import { validateAdminAuth } from "@/lib/admin-auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const admin = await validateAdminAuth(request)
    if (!admin) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subject_id, exam_id } = body

    if (!subject_id) {
      return Response.json({ success: false, message: "Subject ID is required" }, { status: 400 })
    }

    // Get all tutors who teach this subject
    const tutors = await sql`
      SELECT DISTINCT
        t.id,
        t.name,
        t.department
      FROM tutors t
      JOIN tutor_subjects ts ON t.id = ts.tutor_id
      WHERE ts.subject_id = ${Number(subject_id)}
      ORDER BY t.name
    `

    return Response.json({
      success: true,
      tutors: tutors || [],
    })
  } catch (error) {
    console.error("[MYT] Error fetching tutors by subject:", error)
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
