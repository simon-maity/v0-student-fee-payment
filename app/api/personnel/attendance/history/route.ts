import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const personnelId = request.nextUrl.searchParams.get("personnelId")
    const userType = request.nextUrl.searchParams.get("userType")
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10")
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0")
    const month = request.nextUrl.searchParams.get("month")

    if (!personnelId || !userType) {
      return NextResponse.json(
        { success: false, message: "Personnel ID and user type are required" },
        { status: 400 }
      )
    }

    // Parse personnel ID as integer with validation
    const parsedPersonnelId = parseInt(personnelId, 10)
    if (isNaN(parsedPersonnelId)) {
      return NextResponse.json(
        { success: false, message: "Invalid personnel ID format" },
        { status: 400 }
      )
    }

    // Get today's date for calculations
    const today = new Date().toISOString().split("T")[0]
    let monthStart = null
    let monthEnd = null

    if (month) {
      // Parse month in YYYY-MM format
      const monthDate = new Date(`${month}-01`)
      monthStart = month
      const nextMonth = new Date(monthDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      monthEnd = nextMonth.toISOString().split("T")[0]
    }

    // Get total count with proper parameterized query
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM personnel_attendance 
      WHERE user_id = $1 
        AND user_type = $2
    `
    const countParams = [parsedPersonnelId, userType]

    if (monthStart && monthEnd) {
      countQuery += ` AND attendance_date >= $3 AND attendance_date < $4`
      countParams.push(monthStart, monthEnd)
    }

    const countResult = await sql(countQuery, countParams)
    const total = countResult[0]?.total || 0

    // Get paginated records with proper parameterized query
    let recordsQuery = `
      SELECT 
        id, 
        attendance_date as date, 
        attendance_type as type, 
        marked_at as "markedAt", 
        campus_location as campus,
        latitude,
        longitude,
        location_verified as verified,
        status
      FROM personnel_attendance 
      WHERE user_id = $1 
        AND user_type = $2
    `
    const recordsParams = [parsedPersonnelId, userType]

    if (monthStart && monthEnd) {
      recordsQuery += ` AND attendance_date >= $3 AND attendance_date < $4`
      recordsParams.push(monthStart, monthEnd)
    }

    recordsQuery += ` ORDER BY attendance_date DESC, marked_at DESC
      LIMIT $${recordsParams.length + 1} OFFSET $${recordsParams.length + 2}`
    recordsParams.push(limit, offset)

    const records = await sql(recordsQuery, recordsParams)

    // Calculate daily summaries with proper parameterized query
    let dailyQuery = `
      SELECT 
        attendance_date as date,
        COUNT(*) as marks_count,
        CASE WHEN COUNT(*) >= 2 THEN true ELSE false END as is_complete,
        MIN(marked_at) as first_mark,
        MAX(marked_at) as last_mark,
        STRING_AGG(DISTINCT campus_location, ', ') as campuses
      FROM personnel_attendance 
      WHERE user_id = $1 
        AND user_type = $2
    `
    const dailyParams = [parsedPersonnelId, userType]

    if (monthStart && monthEnd) {
      dailyQuery += ` AND attendance_date >= $3 AND attendance_date < $4`
      dailyParams.push(monthStart, monthEnd)
    }

    dailyQuery += ` GROUP BY attendance_date
      ORDER BY attendance_date DESC`

    const dailySummaries = await sql(dailyQuery, dailyParams)

    // Calculate statistics with proper parameterized query
    let statsQuery = `
      SELECT 
        COUNT(DISTINCT attendance_date) as total_days,
        SUM(CASE WHEN daily_count >= 2 THEN 1 ELSE 0 END) as completed_days,
        SUM(CASE WHEN daily_count = 1 THEN 1 ELSE 0 END) as partial_days,
        COUNT(*) as total_marks
      FROM (
        SELECT attendance_date, COUNT(*) as daily_count
        FROM personnel_attendance 
        WHERE user_id = $1 
          AND user_type = $2
    `
    const statsParams = [parsedPersonnelId, userType]

    if (monthStart && monthEnd) {
      statsQuery += ` AND attendance_date >= $3 AND attendance_date < $4`
      statsParams.push(monthStart, monthEnd)
    }

    statsQuery += ` GROUP BY attendance_date
      ) daily_stats`

    const statsResult = await sql(statsQuery, statsParams)

    const stats = statsResult[0] || {}

    const totalPages = Math.ceil(total / limit)
    const currentPage = Math.floor(offset / limit) + 1

    return NextResponse.json({
      success: true,
      pagination: {
        limit,
        offset,
        total,
        pages: totalPages,
        currentPage,
      },
      statistics: {
        totalDays: parseInt(stats.total_days) || 0,
        completedDays: parseInt(stats.completed_days) || 0,
        partialDays: parseInt(stats.partial_days) || 0,
        completionPercentage:
          stats.total_days > 0 ? Math.round(((stats.completed_days || 0) / stats.total_days) * 100) : 0,
        totalMarks: parseInt(stats.total_marks) || 0,
      },
      records: records.map((r: any) => ({
        id: r.id,
        date: r.date,
        type: r.type,
        markedAt: r.markedAt,
        campus: r.campus,
        location: { latitude: r.latitude, longitude: r.longitude },
        verified: r.verified,
        status: r.status,
      })),
      dailySummary: dailySummaries.map((d: any) => ({
        date: d.date,
        marksCount: parseInt(d.marks_count),
        isComplete: d.is_complete,
        firstMark: d.first_mark,
        lastMark: d.last_mark,
        campuses: d.campuses ? d.campuses.split(", ") : [],
      })),
    })
  } catch (error) {
    console.error("[Personnel Attendance History] Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch attendance history" },
      { status: 500 }
    )
  }
}
