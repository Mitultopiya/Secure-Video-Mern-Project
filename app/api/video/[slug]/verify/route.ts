import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyPassword } from "@/lib/utils/password"

const RATE_LIMIT_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { password } = await request.json()
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const supabase = await createClient()

    // Get video by slug
    const { data: video, error: videoError } = await supabase.from("videos").select("*").eq("slug", slug).single()

    if (videoError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // If no password is set, grant access
    if (!video.password_hash) {
      // Log access
      await supabase.from("video_access_logs").insert({
        video_id: video.id,
        ip_address: ip,
        user_agent: request.headers.get("user-agent"),
      })

      // Increment view count
      await supabase
        .from("videos")
        .update({ view_count: video.view_count + 1 })
        .eq("id", video.id)

      return NextResponse.json({
        success: true,
        video: {
          title: video.title,
          description: video.description,
          blob_url: video.blob_url,
          mime_type: video.mime_type,
        },
      })
    }

    // Check rate limiting
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
    const { data: recentAttempts } = await supabase
      .from("password_attempts")
      .select("id")
      .eq("video_id", video.id)
      .eq("ip_address", ip)
      .eq("success", false)
      .gte("attempted_at", windowStart)

    if (recentAttempts && recentAttempts.length >= RATE_LIMIT_ATTEMPTS) {
      return NextResponse.json(
        {
          error: "Too many failed attempts. Please try again later.",
          retryAfter: 15 * 60,
        },
        { status: 429 },
      )
    }

    // Check if password has expired
    const now = new Date()
    const passwordExpired = video.password_expires_at && new Date(video.password_expires_at) < now

    if (passwordExpired && !video.allow_expired_password) {
      return NextResponse.json(
        {
          error: "Password has expired. Please contact the video owner for a new password.",
          expired: true,
        },
        { status: 403 },
      )
    }

    const isValid = await verifyPassword(password, video.password_hash)

    // Log the attempt
    await supabase.from("password_attempts").insert({
      video_id: video.id,
      ip_address: ip,
      success: isValid,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Log successful access
    await supabase.from("video_access_logs").insert({
      video_id: video.id,
      ip_address: ip,
      user_agent: request.headers.get("user-agent"),
    })

    // Increment view count
    await supabase
      .from("videos")
      .update({ view_count: video.view_count + 1 })
      .eq("id", video.id)

    return NextResponse.json({
      success: true,
      video: {
        title: video.title,
        description: video.description,
        blob_url: video.blob_url,
        mime_type: video.mime_type,
      },
    })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
