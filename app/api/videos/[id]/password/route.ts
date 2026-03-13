import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashPassword } from "@/lib/utils/password"
import { getExpirationDate, type PasswordExpiration } from "@/lib/types"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { password, passwordExpiration, allowExpiredPassword } = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: existingVideo, error: getError } = await supabase
      .from("videos")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (getError || !existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Hash new password if provided
    let passwordHash: string | null = null
    let passwordExpiresAt: string | null = null

    if (password && password.trim()) {
      passwordHash = await hashPassword(password)
      const expDate = getExpirationDate(passwordExpiration as PasswordExpiration)
      passwordExpiresAt = expDate?.toISOString() || null
    }

    // Update video
    const { data: video, error: updateError } = await supabase
      .from("videos")
      .update({
        password_hash: passwordHash,
        password_expires_at: passwordExpiresAt,
        allow_expired_password: allowExpiredPassword,
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: existingVideo, error: getError } = await supabase
      .from("videos")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (getError || !existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Remove password
    const { data: video, error: updateError } = await supabase
      .from("videos")
      .update({
        password_hash: null,
        password_expires_at: null,
        allow_expired_password: false,
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to remove password" }, { status: 500 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error("Password remove error:", error)
    return NextResponse.json({ error: "Remove failed" }, { status: 500 })
  }
}
