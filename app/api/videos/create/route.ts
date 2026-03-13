import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateSlug, getExpirationDate } from "@/lib/types"
import { hashPassword } from "@/lib/utils/password"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, blobUrl, password, passwordExpiration, allowExpiredPassword, fileSize, mimeType } = body

    if (!title || !blobUrl) {
      return NextResponse.json({ error: "Title and blob URL are required" }, { status: 400 })
    }

    // Generate unique slug
    const slug = generateSlug()

    // Hash password if provided
    let passwordHash = null
    let passwordExpiresAt = null

    if (password) {
      passwordHash = await hashPassword(password)
      passwordExpiresAt = getExpirationDate(passwordExpiration || "24h")
    }

    // Insert video record
    const { data: video, error } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        slug,
        blob_url: blobUrl,
        file_size: fileSize || 0,
        mime_type: mimeType || "video/mp4",
        password_hash: passwordHash,
        password_expires_at: passwordExpiresAt ? passwordExpiresAt.toISOString() : null,
        allow_expired_password: allowExpiredPassword || false,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to save video" }, { status: 500 })
    }

    const baseUrl = request.headers.get("origin") || ""

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        slug: video.slug,
        title: video.title,
        url: `${baseUrl}/v/${video.slug}`,
      },
    })
  } catch (error) {
    console.error("[v0] Create video error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create video" },
      { status: 500 },
    )
  }
}
