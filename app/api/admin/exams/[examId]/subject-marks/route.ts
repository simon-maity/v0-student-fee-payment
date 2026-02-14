import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest, { params }: { params: { examId: string } }) {
  const examId = Number(params.examId)
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subjectId")

  console.log("[MYT] Fetching marks for examId:", examId, "subjectId:", subjectId)

  if (!subjectId) {
    return NextResponse.json({ success: false, message: "Subject ID is required" }, { status: 400 })
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    const marks = await sql`
      SELECT 
        s.full_name as student_name,
        s.enrollment_number,
        em.marks_obtained,
        em.total_marks,
        em.status,
        em.submission_date
      FROM exam_marks em
      JOIN students s ON em.student_id = s.id
      WHERE em.exam_id = ${examId}
        AND em.subject_id = ${Number(subjectId)}
      ORDER BY s.enrollment_number ASC
    `

    console.log("[MYT] Marks query result:", marks.length, "records found")
    console.log("[MYT] Sample marks data:", marks.slice(0, 2))

    return NextResponse.json({ success: true, marks })
  } catch (error: any) {
    console.error("[MYT] Error fetching marks:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
