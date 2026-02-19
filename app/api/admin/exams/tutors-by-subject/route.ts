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

    console.log("[v0] tutors-by-subject API called with:", { subject_id, exam_id })

    if (!subject_id) {
      return Response.json({ success: false, message: "Subject ID is required" }, { status: 400 })
    }

    // Try to get tutors from tutor_subjects first (those assigned to this subject)
    let tutors = await sql`
      SELECT DISTINCT
        t.id,
        t.name,
        t.department
      FROM tutors t
      JOIN tutor_subjects ts ON t.id = ts.tutor_id
      WHERE ts.subject_id = ${Number(subject_id)}
      ORDER BY t.name
    `

    console.log("[v0] Found tutors from tutor_subjects:", tutors)

    // If no tutors found in tutor_subjects, return all tutors as fallback
    if (!tutors || tutors.length === 0) {
      console.log("[v0] No tutors in tutor_subjects, falling back to all tutors")
      tutors = await sql`
        SELECT 
          t.id,
          t.name,
          t.department
        FROM tutors t
        ORDER BY t.name
      `
      console.log("[v0] All available tutors:", tutors)
    }

    return Response.json({
      success: true,
      tutors: Array.isArray(tutors) ? tutors : [],
    })
  } catch (error) {
    console.error("[v0] Error fetching tutors by subject:", error)
    return Response.json(
      { success: false, message: "Internal server error", error: String(error) },
      { status: 500 }
    )
  }
}
