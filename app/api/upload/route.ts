import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateSlug } from "@/lib/utils/slug"
import { getExpirationDate, type PasswordExpiration } from "@/lib/types"
import { hashPassword } from "@/lib/utils/password"

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  console.log("[v0] Upload route started")

  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check:", { userId: user?.id, authError: authError?.message })

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch (e) {
      console.log("[v0] FormData parse error:", e)
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = (formData.get("description") as string) || null
    const password = formData.get("password") as string | null
    const passwordExpiration = (formData.get("passwordExpiration") as PasswordExpiration) || "never"
    const allowExpiredPassword = formData.get("allowExpiredPassword") === "true"

    console.log("[v0] Form data:", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      title,
      hasPassword: !!password,
    })

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 100MB limit" }, { status: 400 })
    }

    // Generate unique slug
    const slug = generateSlug()
    console.log("[v0] Generated slug:", slug)

    // Upload to Vercel Blob
    console.log("[v0] Starting blob upload...")
    let blob
    try {
      blob = await put(`videos/${user.id}/${slug}/${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
      })
      console.log("[v0] Blob upload success:", blob.url)
    } catch (blobError) {
      console.log("[v0] Blob upload error:", blobError)
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 })
    }

    // Hash password if provided
    let passwordHash: string | null = null
    if (password && password.trim()) {
      try {
        passwordHash = await hashPassword(password)
        console.log("[v0] Password hashed successfully")
      } catch (hashError) {
        console.log("[v0] Password hash error:", hashError)
        return NextResponse.json({ error: "Failed to hash password" }, { status: 500 })
      }
    }

    // Calculate password expiration
    const passwordExpiresAt = password ? getExpirationDate(passwordExpiration) : null

    // Store video metadata in database
    console.log("[v0] Inserting into database...")
    const { data: video, error: dbError } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        slug,
        title,
        description,
        blob_url: blob.url,
        file_size: file.size,
        mime_type: file.type,
        password_hash: passwordHash,
        password_expires_at: passwordExpiresAt?.toISOString() || null,
        allow_expired_password: allowExpiredPassword,
      })
      .select()
      .single()

    if (dbError) {
      console.log("[v0] Database error:", dbError.message, dbError.details, dbError.hint)
      return NextResponse.json({ error: `Failed to save video: ${dbError.message}` }, { status: 500 })
    }

    console.log("[v0] Video saved successfully:", video.id)

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        slug: video.slug,
        title: video.title,
        url: `${request.nextUrl.origin}/v/${slug}`,
      },
    })
  } catch (error) {
    console.log("[v0] Unexpected error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
