import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin status
    const isAdmin = user.user_metadata?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all videos grouped by user
    const { data: videos } = await supabase.from("videos").select("user_id, file_size")

    // Aggregate stats by user
    const userStats = new Map<string, { video_count: number; total_storage: number }>()

    videos?.forEach((v) => {
      const existing = userStats.get(v.user_id) || { video_count: 0, total_storage: 0 }
      userStats.set(v.user_id, {
        video_count: existing.video_count + 1,
        total_storage: existing.total_storage + v.file_size,
      })
    })

    // Get unique user IDs from videos
    const userIds = Array.from(new Set(videos?.map((v) => v.user_id) || []))

    // Build user list with stats
    const users = userIds.map((id) => {
      const stats = userStats.get(id) || { video_count: 0, total_storage: 0 }
      return {
        id,
        email: `user-${id.slice(0, 8)}@securevideo.app`, // Placeholder - would need auth admin API for real emails
        is_admin: false, // Would need auth admin API to check
        video_count: stats.video_count,
        total_storage: stats.total_storage,
        created_at: new Date().toISOString(), // Would need auth admin API for real date
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 })
  }
}
