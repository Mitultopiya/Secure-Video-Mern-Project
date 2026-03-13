import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Get video by slug
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("id, slug, title, description, password_hash, password_expires_at, allow_expired_password, created_at")
      .eq("slug", slug)
      .single()

    if (videoError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Calculate password status
    const hasPassword = !!video.password_hash
    let passwordExpired = false

    if (hasPassword && video.password_expires_at) {
      passwordExpired = new Date(video.password_expires_at) < new Date()
    }

    return NextResponse.json({
      slug: video.slug,
      title: video.title,
      description: video.description,
      hasPassword,
      passwordExpired,
      allowExpiredPassword: video.allow_expired_password,
      createdAt: video.created_at,
    })
  } catch (error) {
    console.error("Get video error:", error)
    return NextResponse.json({ error: "Failed to get video" }, { status: 500 })
  }
}
