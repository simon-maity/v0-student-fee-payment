import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function debugTutorSubjects() {
  try {
    console.log("[DEBUG] Checking tutor_subjects data...")

    // Check if tutor_subjects table exists and has data
    const tutorSubjects = await sql`
      SELECT COUNT(*) as count FROM tutor_subjects
    `
    console.log("[DEBUG] Total tutor_subjects records:", tutorSubjects[0]?.count || 0)

    // Get all tutor-subject mappings
    const mappings = await sql`
      SELECT 
        t.id,
        t.name as tutor_name,
        s.id as subject_id,
        s.name as subject_name,
        s.code
      FROM tutor_subjects ts
      JOIN tutors t ON ts.tutor_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      LIMIT 20
    `
    console.log("[DEBUG] Tutor-Subject mappings (first 20):")
    console.table(mappings)

    // Test a specific query
    if (mappings.length > 0) {
      const testSubjectId = mappings[0].subject_id
      console.log(`\n[DEBUG] Testing tutors for subject ID ${testSubjectId}...`)
      
      const tutorsForSubject = await sql`
        SELECT DISTINCT
          t.id,
          t.name,
          t.department
        FROM tutors t
        JOIN tutor_subjects ts ON t.id = ts.tutor_id
        WHERE ts.subject_id = ${testSubjectId}
        ORDER BY t.name
      `
      console.log(`[DEBUG] Found ${tutorsForSubject.length} tutors for subject ${testSubjectId}:`)
      console.table(tutorsForSubject)
    }
  } catch (error) {
    console.error("[ERROR] Debug query failed:", error)
  }
}

debugTutorSubjects()
